import {
  toPathPieces,
  get,
  set,
  modify,
  remove1,
  rename,
  equal,
  unknownOp,
  getIDBError
} from './util';

export const ops: {[s: string]: any} = {};

ops.$set = (path_pieces: any, value: any) => (doc: any) => {
  set(doc, path_pieces, value);
};

ops.$unset = (path_pieces: any) => (doc: any) => remove1(doc, path_pieces);

ops.$rename = (path_pieces: any, new_name: any) => (doc: any) => {
  rename(doc, path_pieces, new_name);
};

export const modifyOp = (path_pieces: any, update: any, init: any) => (doc: any) => {
  modify(doc, path_pieces, update, init);
};

export const arithOp = (fn: { (a: any, b: any): any; (a: any, b: any): number; (arg0: any, arg1: number): any; }) => (path_pieces: any, value1: any) => {
  const update = (obj: { [x: string]: any; }, field: string | number) => {
    const value2 = obj[field];
    if (typeof value2 === 'number') {
      obj[field] = fn(value1, value2);
    }
  };
  const init: any = (obj: { [x: string]: number; }, field: string | number) => obj[field] = 0;
  return modifyOp(path_pieces, update, init);
};

ops.$inc = arithOp((a, b) => a + b);
ops.$mul = arithOp((a, b) => a * b);

export const compareOp = (fn: { (a: any, b: any): boolean; (a: any, b: any): boolean; (arg0: any, arg1: any): any; }) => (path_pieces: any, value: any) => {
  const update = (obj: { [x: string]: any; }, field: string | number) => {
    if (fn(value, obj[field])) { obj[field] = value; }
  };

  const init = (obj: { [x: string]: any; }, field: string | number) => obj[field] = value;

  return modifyOp(path_pieces, update, init);
};

ops.$min = compareOp((a, b) => a < b);
ops.$max = compareOp((a, b) => a > b);

ops.$push = (path_pieces: any, value: any) => {
  const update = (obj: { [x: string]: any; }, field: string | number) => {
    const elements = obj[field];

    if (Array.isArray(elements)) {
      elements.push(value);
    }
  };

  const init: any = (obj: { [x: string]: any[]; }, field: string | number) => obj[field] = [value];

  return modifyOp(path_pieces, update, init);
};

ops.$pop = (path_pieces: any, direction: number) => {
  let pop;

  if (direction < 1) {
    pop = (e: any[]) => e.shift();
  } else {
    pop = (e: any[]) => e.pop();
  }

  return (doc: any) => {
    get(doc, path_pieces, (obj: { [x: string]: any; }, field: string | number) => {
      const elements = obj[field];

      if (Array.isArray(elements)) { pop(elements); }
    });
  };
};

ops.$pullAll = (path_pieces: any, values: any) => (doc: any) => {
  get(doc, path_pieces, (obj: { [x: string]: any[]; }, field: string | number) => {
    const elements = obj[field];
    if (!Array.isArray(elements)) { return; }

    const new_elements = [];

    const hasValue = (value1: any) => {
      for (let value2 of values) {
        if (equal(value1, value2)) { return true; }
      }
    };

    for (let element of elements) {
      if (!hasValue(element)) {
        new_elements.push(element);
      }
    }

    obj[field] = new_elements;
  });
};

ops.$pull = (path_pieces: any, value: any) => {
  return ops.$pullAll(path_pieces, [value]);
};

ops.$addToSet = (path_pieces: any, value: any) => (doc: any) => {
  get(doc, path_pieces, (obj: { [x: string]: any; }, field: string | number) => {
    const elements = obj[field];
    if (!Array.isArray(elements)) { return; }

    for (let element of elements) {
      if (equal(element, value)) { return; }
    }

    elements.push(value);
  });
};

export const build = (steps: any[], field: any, value: { [x: string]: any; }) => {
  if (field[0] !== '$') {
    return steps.push(ops.$set(toPathPieces(field), value));
  }

  const op = ops[field];
  if (!op) { unknownOp(field); }

  for (let path in value) {
    steps.push(op(toPathPieces(path), value[path]));
  }
};

export const update = (cur: any, spec: any, cb: any) => {
  const steps: string | any[] = [];

  for (let field in spec) { build(steps, field, spec[field]); }

  if (!steps.length) { return cb(null); }

  (function iterate() {
    cur._next((error: any, doc: any, idb_cur: any) => {
      if (!doc) { return cb(error); }

      for (let fn of steps) { fn(doc); }

      const idb_req = idb_cur.update(doc);

      idb_req.onsuccess = iterate;
      idb_req.onerror = (e: any) => cb(getIDBError(e));
    });
  })();
};

export default update
