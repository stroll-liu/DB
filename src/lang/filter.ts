import {
  isObject,
  equal,
  unknownOp
} from '../util'

import MISSING from './missing_symbol'
import Path from './path'
import Fields from './fields'

const GT: any = globalThis

export const isIndexMatchable = (value: any) => {
  if (typeof value === 'number') { return !isNaN(value); }
  if (typeof value === 'string') { return true; }
  if (typeof value === 'boolean') { return true; }
  if (!value) { return false; }
  if (value.constructor === Object) { return false; }

  if (Array.isArray(value)) {
    for (let element of value) {
      if (!isIndexMatchable(element)) {
        return false;
      }
    }
    return true;
  }

  if (value instanceof Date) {
    return !isNaN(value.valueOf());
  }

  return false;
};

export class Operator {
  _is_index_matchable: any;
  getClauses() {
    return this._is_index_matchable ? [this] : [];
  }
}

export class Connective extends Operator {
  args: any;
  constructor(args: any) {
    super();

    this.args = args;
  }
}

export class Conjunction extends Connective {
  getClauses() {
    const clauses = [];

    for (let i = 0; i < this.args.length; i++) {
      const op = this.args[i];

      if (op instanceof Connective) {
        clauses.push(...op.getClauses());
      } else if (op.is_index_matchable) {
        op.parent = this;
        op.index = i;

        clauses.push(op);
      }
    }

    return clauses;
  }

  run(fields: any) {
    for (let arg of this.args) {
      if (!arg.run(fields)) { return false; }
    }

    return true;
  }
}

export class Disjunction extends Connective {
  getClauses() { return []; }

  run(fields: any) {
    for (let arg of this.args) {
      if (arg.run(fields)) { return true; }
    }

    return false;
  }
}

export class Negation extends Conjunction {
  getClauses() { return []; }

  run(fields: any) { return !super.run(fields); }
}

export class Exists extends Operator {
  path: any;
  bool: any;
  constructor(path: any, bool: any) {
    super();

    this.path = path;
    this.bool = bool;
  }

  get is_index_matchable() { return !!this.bool; }

  run(fields: any) {
    return fields.get(this.path) !== MISSING === this.bool;
  }
}

export class Equal extends Operator {
  path: any;
  value: any;
  constructor(path: any, value: any) {
    super();

    this.path = path;
    this.value = value;
  }

  get is_index_matchable() {
    return isIndexMatchable(this.value);
  }

  get idb_key_range() {
    return GT.IDBKeyRange.only(this.value);
  }

  run(fields: any) {
    const value = fields.get(this.path);
    if (value === MISSING) { return false; }

    return equal(value, this.value);
  }
}

export class NotEqual extends Equal {
  get is_index_matchable() { return false; }

  run(fields: any) { return !super.run(fields); }
}

export class Range extends Operator {
  path: any;
  fns: any;
  values: any;
  constructor(path: any, fns: any, values: any) {
    super();

    this.path = path;
    this.fns = fns;
    this.values = values;
  }

  get is_index_matchable() { return true; }

  run(fields: any) {
    const value = fields.get(this.path);

    if (value === MISSING || value == null) {
      return false;
    }

    const { fns, values } = this;

    for (let i = 0; i < fns.length; i++) {
      if (!fns[i](value, values[i])) {
        return false;
      }
    }

    return true;
  }
}

export const rangeMixin = (...fns: any) => {
  return class extends Range {
    constructor(path: any, values: any) { super(path, fns, values); }
  };
};

export const gt = (a: any, b: any) => a > b,
  gte = (a: any, b: any) => a >= b,
  lt = (a: any, b: any) => a < b,
  lte = (a: any, b: any) => a <= b;

  export class Gt extends rangeMixin(gt) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.lowerBound(...this.values, true);
  }
}

export class Gte extends rangeMixin(gte) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.lowerBound(...this.values);
  }
}

export class Lt extends rangeMixin(lt) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.upperBound(...this.values, true);
  }
}

export class Lte extends rangeMixin(lte) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.upperBound(...this.values);
  }
}

export class GtLt extends rangeMixin(gt, lt) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.bound(...this.values, true, true);
  }
}

export class GteLt extends rangeMixin(gte, lt) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.bound(...this.values, false, true);
  }
}

export class GtLte extends rangeMixin(gt, lte) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.bound(...this.values, true, false);
  }
}

export class GteLte extends rangeMixin(gte, lte) {
  declare values: any;
  get idb_key_range() {
    return GT.IDBKeyRange.bound(...this.values);
  }
}

export class ElemMatch extends Operator {
  path: any;
  op: any;
  constructor(path: any, op: any) {
    super();

    this.path = path;
    this.op = op;
  }

  get is_index_matchable() { return false; }

  run(fields: any) {
    const elements = fields.get(this.path);

    if (!elements || !elements[Symbol.iterator]) {
      return false;
    }

    const { op } = this;

    for (let obj of elements) {
      if (isObject(obj) && op.run(new Fields(obj))) {
        return true;
      }
    }

    return false;
  }
}

export class RegEx extends Operator {
  path: any;
  expr: any;
  constructor(path: any, expr: any) {
    super();

    this.path = path;
    this.expr = expr;
  }

  get is_index_matchable() { return false; }

  run(fields: any) {
    const value = fields.get(this.path);
    if (value === MISSING) { return false; }

    return this.expr.test(value);
  }
}

export const $and = (parent_args: any, args: any) => {
  for (let expr of args) {
    const arg = build(expr);

    if (arg === false) { return false; }
    if (!arg) { continue; }

    if (arg.constructor === Conjunction) {
      parent_args.push(...arg.args);
    } else { parent_args.push(arg); }
  }

  return true;
};

export const $or = (parent_args: any, args: any) => {
  const new_args = [];

  let has_false;

  for (let expr of args) {
    const arg = build(expr);

    if (!arg) {
      if (arg === false) { has_false = true; }

      continue;
    }

    if (arg.constructor === Disjunction) {
      new_args.push(...arg.args);
    } else { new_args.push(arg); }
  }

  if (new_args.length > 1) {
    parent_args.push(new Disjunction(new_args));
  } else if (new_args.length) {
    parent_args.push(new_args[0]);
  } else if (has_false) { return false; }

  return true;
};

export const $not = (parent_args: any, args: any) => {
  const new_args = [];

  for (let expr of args) {
    const arg = build(expr);

    if (arg) { new_args.push(arg); }
  }

  if (new_args.length) {
    parent_args.push(new Negation(new_args));
  }

  return true;
};

export const connectives: any = {
  $and,
  $or,
  $not,
  $nor: $not
};

export const ranges: any = [
  [GtLt, '$gt', '$lt'],
  [GteLt, '$gte', '$lt'],
  [GtLte, '$gt', '$lte'],
  [GteLte, '$gte', '$lte'],
  [Gt, '$gt'],
  [Gte, '$gte'],
  [Lt, '$lt'],
  [Lte, '$lte']
];

export const buildRange = (new_args: any, path: any, params: any, op_keys: any) => {
  const build = (RangeOp: any, range_keys: any) => {
    const values = [];

    for (let name of range_keys) {
      if (!op_keys.has(name)) { return; }

      const value = params[name];
      if (!isIndexMatchable(value)) { return false; }

      values.push(value);
    }

    new_args.push(new RangeOp(path, values));

    return true;
  };

  for (let [RangeOp, ...range_keys] of ranges) {
    const result = build(RangeOp, range_keys);

    if (result === false) { return; }
    if (!result) { continue; }

    op_keys.delete('$gt');
    op_keys.delete('$gte');
    op_keys.delete('$lt');
    op_keys.delete('$lte');

    break;
  }

  return true;
};

export const buildClause = (parent_args: any, path: any, params: any) => {
  const withoutOps = () => {
    parent_args.push(new Equal(path, params));

    return true;
  };

  if (params == null || params.constructor !== Object) {
    return withoutOps();
  }

  const op_keys = new Set(Object.keys(params));

  if (op_keys.has('$exists') && !params.$exists) {
    parent_args.push(new Exists(path, false));

    return true;
  }

  const new_args = [];

  if (op_keys.has('$eq')) {
    new_args.push(new Equal(path, params.$eq));

    op_keys.delete('$eq');
  }

  if (op_keys.has('$ne')) {
    new_args.push(new NotEqual(path, params.$ne));

    op_keys.delete('$ne');
  }

  if (!buildRange(new_args, path, params, op_keys)) {
    return false;
  }

  if (op_keys.has('$in')) {
    const eqs = [];

    for (let value of params.$in) {
      eqs.push(new Equal(path, value));
    }

    if (eqs.length > 1) {
      new_args.push(new Disjunction(eqs));
    } else if (eqs.length) { new_args.push(eqs[0]); }

    op_keys.delete('$in');
  }

  if (op_keys.has('$nin')) {
    for (let value of params.$nin) {
      new_args.push(new NotEqual(path, value));
    }

    op_keys.delete('$nin');
  }

  if (op_keys.has('$elemMatch')) {
    const op = build(params.$elemMatch);

    if (op) { new_args.push(new ElemMatch(path, op)); }

    op_keys.delete('$elemMatch');
  }

  if (op_keys.has('$regex')) {
    const expr = new RegExp(params.$regex, params.$options);

    new_args.push(new RegEx(path, expr));

    op_keys.delete('$regex');
    op_keys.delete('$options');
  }

  if (params.$exists && !new_args.length) {
    new_args.push(new Exists(path, true));

    op_keys.delete('$exists');
  }

  for (let name of op_keys) {
    if (name[0] === '$') { unknownOp(name); }
  }

  if (!new_args.length) { return withoutOps(); }

  parent_args.push(...new_args);

  return true;
};

export const build = (expr: any) => {
  const args: any = [];

  for (let field in expr) {
    let value = expr[field], result;

    if (field[0] !== '$') {
      result = buildClause(args, new Path(field), value);
    } else {
      if (!Array.isArray(value)) { value = [value]; }

      const fn = connectives[field];
      if (!fn) { unknownOp(field); }

      result = fn(args, value);
    }

    if (!result) { return result; }
  }

  if (!args.length) { return; }
  if (args.length === 1) { return args[0]; }

  return new Conjunction(args);
};

export default {
  build,
  Conjunction,
  Disjunction,
  Exists
}

