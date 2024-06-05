import {
  toPathPieces,
  set,
  remove2,
  copy
} from './util'

import build from './lang/expression'
import Fields from './lang/fields'

export const addition = (doc: any, new_doc: any, new_fields: any[]) => {
  for (let [path_pieces, add] of new_fields) {
    add(doc, new_doc, path_pieces);
  }

  return new_doc;
};

const _build = (value1: any) => {
  const { ast, paths, has_refs } = build(value1);
  if (!has_refs) {
    const value2 = ast.run();
    return (doc: any, ...args: any) => set(args, value2);
  }

  return (doc: any, ...args: any) => {
    const fields: any = new Fields(doc);
    if (fields.ensure(paths)) {
      set(args, ast.run(fields));
    }
  };
};

export const project = (_next: any, spec: any) => {
  const toBool = (path: string) => !!spec[path];
  let _id_bool = true;
  if (spec.hasOwnProperty('_id')) {
    _id_bool = toBool('_id');
    delete spec._id;
  }

  const existing_fields: any = [], new_fields: any = [];
  let is_inclusion = true;
  const _mode = (path: string) => {
    if (toBool(path) !== is_inclusion) {
      throw Error('cannot mix inclusions and exclusions');
    }
  };
  let mode = (path: string) => {
    is_inclusion = toBool(path);
    mode = _mode;
  };
  for (let path in spec) {
    const value = spec[path];
    const path_pieces = toPathPieces(path);
    if (typeof value === 'boolean' ||
      value === 1 ||
      value === 0) {
      mode(path);
      existing_fields.push(path_pieces);
    } else {
      new_fields.push([path_pieces, _build(value)]);
    }
  }
  const steps: any = [];
  if (new_fields.length) {
    steps.push((doc: any, new_doc: any) => {
      return addition(doc, new_doc, new_fields);
    });
  }
  if (!existing_fields.length) {
    let project;
    if (_id_bool) {
      project = (doc: { hasOwnProperty: (arg0: string) => any; _id: any; }, new_doc: { _id: any; }) => {
        if (doc.hasOwnProperty('_id')) {
          new_doc._id = doc._id;
        }
      };
    } else {
      project = (doc: any, new_doc: { _id: any; }) => {
        delete new_doc._id;
      };
    }
    steps.push((doc: { hasOwnProperty: (arg0: string) => any; _id: any; }, new_doc: { _id: any; }) => {
      project(doc, new_doc);

      return new_doc;
    });
  } else {
    if (is_inclusion === _id_bool) {
      existing_fields.push(['_id']);
    }
    const project = is_inclusion ? copy : remove2;
    steps.push((doc: any) => project(doc, existing_fields));
  }
  const next = (cb: any) => {
    _next((error: any, doc: any) => {
      if (!doc) { return cb(error); }
      let new_doc = doc;
      for (let fn of steps) {
        new_doc = fn(doc, new_doc);
      }
      cb(null, new_doc);
    });
  };
  return next;
};

export default project;
