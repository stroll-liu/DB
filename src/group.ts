import memoize from 'memoizee';

import { unknownOp, hashify } from './util'
import build from './lang/expression'
import Fields from './lang/fields'

export class Operator {
  _value: any;
  get value() { return this._value; }

  static getNoRefsSteps(steps: any) { return steps.in_iter; }
  static getOpValue(expr: any, cb: any) { cb(expr.ast.run()); }

  getOpValueWithRefs(expr: any, doc: any, cb: any) {
    const { ast, fields } = expr;
    cb(ast.run(fields));
  }
}

export class Sum extends Operator {
  constructor() {
    super();
    this._value = 0;
  }

  static _verify(value: any, cb: any) {
    if (typeof value === 'number') { cb(value); }
  }

  static getOpValue(expr: any, cb: any) {
    super.getOpValue(expr, (value: any) => Sum._verify(value, cb));
  }

  getOpValueWithRefs(expr: any, doc: any, cb: any) {
    super.getOpValueWithRefs(expr, doc, (value: any) => {
      Sum._verify(value, cb);
    });
  }

  add(value: any) { this._value += value; }
}

export class Avg extends Sum {
  private _count: number;
  constructor() {
    super();
    this._count = 0;
  }

  add(value: any) {
    this._count++;
    super.add(value);
  }

  get value() { return this._value / this._count || 0; }
}

export class Compare extends Operator {
  private _fn: any;
  private _add: (value: any) => void;
  constructor(fn: any) {
    super();
    this._value = null;
    this._fn = fn;
    this._add = this._add1;
  }

  static getNoRefsSteps(steps: any) { return steps.in_end; }

  _add1(value: any) {
    this._value = value;
    this._add = this._add2;
  }

  _add2(new_value: any) {
    if (this._fn(new_value, this._value)) {
      this._value = new_value;
    }
  }

  add(value: any) {
    if (value != null) { this._add(value); }
  }
}

export class Min extends Compare {
  constructor() { super((a: any, b: any) => a < b); }
}

export class Max extends Compare {
  constructor() { super((a: any, b: any) => a > b); }
}

export class Push extends Operator {
  constructor() {
    super();
    this._value = [];
  }

  add(value: any) { this._value.push(value); }
}

export class AddToSet extends Operator {
  private _hashes: any;
  constructor() {
    super();
    this._hashes = {};
  }

  static getNoRefsSteps(steps: any) { return steps.in_end; }

  add(value: any) { this._hashes[hashify(value)] = value; }

  get value() {
    const docs = [];
    for (let hash in this._hashes) {
      docs.push(this._hashes[hash]);
    }
    return docs;
  }
}

export const runSteps = (steps: any, ...args: any) => {
  for (let fn of steps) { fn(...args); }
};

export const runInEnd = (in_end: any, groups: any) => {
  for (let group_doc of groups) {
    runSteps(in_end, group_doc);
  }
};

export const groupLoopFn = (next: any, in_end: any, groups: any, fn: any) => (cb: any) => {
  const done = (error: any) => {
    if (!error) { runInEnd(in_end, groups); }
    cb(error, groups);
  };
  (function iterate() {
    next((error: any, doc: any) => {
      if (!doc) { return done(error); }
      fn(doc);
      iterate();
    });
  })();
};

export const createGroupByRefFn = (next: any, expr: any, steps: any) => {
  const { in_start, in_iter, in_end } = steps;
  const groups: any = [];
  const add = memoize((_id_hash: any, _id: any) => {
    const group_doc = { _id };
    groups.push(group_doc);
    runSteps(in_start, group_doc);
    return group_doc;
  }, { length: 1 });
  const { ast } = expr;
  const _idFn = (doc: any) => ast.run(new Fields(doc));
  let onDoc;
  if (in_iter.length) {
    onDoc = (doc: any) => {
      const _id = _idFn(doc);
      const group_doc = add(hashify(_id), _id);
      runSteps(in_iter, group_doc, doc);
    };
  } else {
    onDoc = (doc: any) => {
      const _id = _idFn(doc);
      add(hashify(_id), _id);
    };
  }
  return groupLoopFn(next, in_end, groups, onDoc);
};

export const createGroupFn = (next: any, expr: any, steps: any) => {
  if (expr.has_refs) {
    return createGroupByRefFn(next, expr, steps);
  }
  const { in_start, in_iter, in_end } = steps;
  const groups: any = [];
  const initGroupDoc = () => {
    const group_doc = { _id: expr.ast.run() };
    runSteps(in_start, group_doc);
    groups.push(group_doc);
    return group_doc;
  };
  if (in_iter.length) {
    const add = memoize(() => initGroupDoc());
    return groupLoopFn(next, in_end, groups, (doc: any) => {
      runSteps(in_iter, add(), doc);
    });
  }
  return (cb: any) => {
    next((error: any, doc: any) => {
      if (doc) {
        initGroupDoc();
        runInEnd(in_end, groups);
      }
      cb(error, groups);
    });
  };
};

export const ops: any = {
  $sum: Sum,
  $avg: Avg,
  $min: Min,
  $max: Max,
  $push: Push,
  $addToSet: AddToSet
};

const _build = (steps: any, field: any, value: any) => {
  const { in_start, in_iter, in_end } = steps;
  const op_strs = Object.keys(value);
  if (op_strs.length > 1) {
    throw Error(`fields must have only one operator`);
  }
  const op_str = op_strs[0], Op = ops[op_str];
  if (!Op) {
    if (op_str[0] === '$') { unknownOp(op_str); }

    throw Error(`unexpected field '${op_str}'`);
  }
  const expr = build(value[op_str]);
  in_start.push((group_doc: any) => {
    group_doc[field] = new Op(expr);
  });
  if (expr.has_refs) {
    in_iter.push((group_doc: any, doc: any) => {
      const fields = new Fields(doc);
      if (!fields.ensure(expr.paths)) { return; }

      const op = group_doc[field],
        _expr = Object.assign({ fields }, expr),
        add = (value: any) => op.add(value);

      op.getOpValueWithRefs(_expr, doc, add);
    });
  } else {
    Op.getOpValue(expr, (value: any) => {
      Op.getNoRefsSteps(steps).push((group_doc: any) => {
        group_doc[field].add(value);
      });
    });
  }
  in_end.push((group_doc: any) => {
    group_doc[field] = group_doc[field].value;
  });
};

export const group = (_next: any, spec: any) => {
  if (!spec.hasOwnProperty('_id')) {
    throw Error("the '_id' field is missing");
  }
  const expr = build(spec._id);
  const new_spec = Object.assign({}, spec);
  delete new_spec._id;
  const steps = {
    in_start: [],
    in_iter: [],
    in_end: []
  };
  for (let field in new_spec) {
    _build(steps, field, new_spec[field]);
  }
  const group = createGroupFn(_next, expr, steps);
  let next = (cb: any) => {
    group((error: any, groups: any) => {
      if (error) { cb(error); }
      else { (next = (cb: any) => cb(null, groups.pop()))(cb); }
    });
  };
  return (cb: any) => next(cb);
};

export default group
