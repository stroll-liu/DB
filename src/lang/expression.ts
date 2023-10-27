import { unknownOp } from '../util'
import MISSING from './missing_symbol'
import Path from './path'

export class Value {
  value: any;
  constructor(value) { this.value = value; }
  get ResultType() { return this.constructor; }
  static any(value) {
    if (typeof value === 'number') {
      return new NumberValue(value);
    }
    if (typeof value === 'string') {
      return new StringValue(value);
    }
    if (Array.isArray(value)) {
      return new ArrayValue(value);
    }
    if (value instanceof Date) {
      return new DateValue(value);
    }
    return new Value(value);
  }
  static literal(value) {
    return new Literal(Value.any(value));
  }
  run() { return this.value; }
}

export class NumberValue extends Value {
  static isType(value) { return typeof value === 'number'; }
}

export class StringValue extends Value {
  static isType(value) { return typeof value === 'string'; }
}

export class ArrayValue extends Value {
  static isType(value) { return Array.isArray(value); }
}

export class DateValue extends Value {
  static isType(value) { return value instanceof Date; }
}

export class Literal extends Value {
  get ResultType() { return this.value.ResultType; }
  run() { return this.value.run(); }
}

export class Get {
  path: any;
  constructor(path) { this.path = path; }
  run(fields) {
    const value = fields.get(this.path);
    return value === MISSING ? null : value;
  }
}

export class ObjectExpr extends Value {
  run(fields) {
    const result: any = {}
    const { value } = this
    for (let field in value) {
      result[field] = value[field].run(fields);
    }
    return result;
  }
}

export class Operator {
  args: any[];
  constructor() { this.args = []; }
  get alt() { return new Value(null); }
  add(node) { this.args.push(node); }
}

export class FnOp extends Operator {
  fn: any;
  constructor(fn) {
    super();
    this.fn = fn;
  }
  get length() { return Infinity; }
  run(fields) {
    const { args, fn } = this;
    return args.map(arg => arg.run(fields)).reduce(fn);
  }
}

export class UnaryFnOp extends FnOp {
  get length() { return 1; }
  run(fields) { return this.fn(this.args[0].run(fields)); }
}

export const fnOp = (Parent, fn) => {
  return class extends Parent {
    constructor() { super(fn); }
  };
};

export const opTypes = (Parent, InputType, ResultType = InputType) => {
  const Constructor = class extends Parent { };
  Constructor.prototype.InputType = InputType;
  Constructor.prototype.ResultType = ResultType;
  return Constructor;
};

export class ArithOp extends opTypes(FnOp, NumberValue) { }

export const arithOp = fn => fnOp(ArithOp, fn);

export class Add extends arithOp((a, b) => a + b) { }
export class Subtract extends arithOp((a, b) => a - b) { }
export class Multiply extends arithOp((a, b) => a * b) { }
export class Divide extends arithOp((a, b) => a / b) { }
export class Mod extends arithOp((a, b) => a % b) { }

export class MathOp extends opTypes(FnOp, NumberValue) {
  get length() { return this.fn.length; }
  run(fields) {
    return this.fn(...this.args.map(arg => arg.run(fields)));
  }
}

export const mathOp = fn => fnOp(MathOp, fn);

export class Abs extends mathOp(Math.abs) { }
export class Ceil extends mathOp(Math.ceil) { }
export class Floor extends mathOp(Math.floor) { }
export class Ln extends mathOp(Math.log) { }
export class Log10 extends mathOp(Math.log10) { }
export class Pow extends mathOp(Math.pow) { }
export class Sqrt extends mathOp(Math.sqrt) { }
export class Trunc extends mathOp(Math.trunc) { }

export class StringConcatOp extends opTypes(FnOp, StringValue) { }
export class Concat extends fnOp(StringConcatOp, (a, b) => a + b) { }

export class CaseOp extends opTypes(UnaryFnOp, StringValue) {
  get alt() { return new StringValue(''); }
}

export class ToLower extends fnOp(CaseOp, s => s.toLowerCase()) { }
export class ToUpper extends fnOp(CaseOp, s => s.toUpperCase()) { }

export class ConcatArraysOp extends opTypes(FnOp, ArrayValue) { }
export class ConcatArrays extends fnOp(ConcatArraysOp, (a, b) => a.concat(b)) { }

export class DateOp extends opTypes(UnaryFnOp, DateValue, NumberValue) { }

export const dateOp = fn => fnOp(DateOp, fn);

export class DayOfMonth extends dateOp(d => d.getDate()) { }
export class Year extends dateOp(d => d.getUTCFullYear()) { }
export class Month extends dateOp(d => d.getUTCMonth() + 1) { }
export class Hour extends dateOp(d => d.getUTCHours()) { }
export class Minute extends dateOp(d => d.getUTCMinutes()) { }
export class Second extends dateOp(d => d.getUTCSeconds()) { }
export class Millisecond extends dateOp(d => d.getUTCMilliseconds()) { }

export class TypeCond {
  result_types: Set<any>;
  stack: any;
  isType: any;
  args: any;
  op: any;
  alt_value: any;
  constructor(stack, args, op) {
    const { InputType, alt } = op;
    this.result_types = new Set([op.ResultType, alt.ResultType]);
    this.stack = stack;
    this.isType = InputType.isType;
    this.args = args;
    this.op = op;
    this.alt_value = alt.value;
  }
  run(fields) {
    const { stack, isType, op } = this;
    const new_args = [];
    for (let arg of this.args) {
      const result = arg.run(fields);
      if (!isType(result)) { return this.alt_value; }
      new_args.push(result);
    }
    for (let i = new_args.length - 1; i >= 0; i--) {
      stack.push(new_args[i]);
    }
    return op.run(fields);
  }
}

export class PopFromStack {
  stack: any;
  constructor(stack) { this.stack = stack; }
  run() { return this.stack.pop(); }
}

export const ops = {
  $add: Add,
  $subtract: Subtract,
  $multiply: Multiply,
  $divide: Divide,
  $mod: Mod,
  $abs: Abs,
  $ceil: Ceil,
  $floor: Floor,
  $ln: Ln,
  $log10: Log10,
  $pow: Pow,
  $sqrt: Sqrt,
  $trunc: Trunc,
  $concat: Concat,
  $toLower: ToLower,
  $toUpper: ToUpper,
  $concatArrays: ConcatArrays,
  $dayOfMonth: DayOfMonth,
  $year: Year,
  $month: Month,
  $hour: Hour,
  $minute: Minute,
  $second: Second,
  $millisecond: Millisecond
};

export const buildOp = (paths, name, args) => {
  const Op = ops[name];
  if (!Op) { unknownOp(name); }
  if (!Array.isArray(args)) { args = [args]; }
  const op = new Op(),
    tc_nodes = [],
    new_paths = [],
    stack = [];
  for (let i = 0; i < args.length && i < op.length; i++) {
    const arg = build(new_paths, args[i]);
    if (arg.ResultType) {
      if (arg.ResultType !== op.InputType) {
        return op.alt;
      }
      op.add(arg);
      continue;
    }
    if (arg instanceof TypeCond) {
      if (!arg.result_types.has(op.InputType)) {
        return op.alt;
      }
      if (arg.result_types.size === 1) {
        op.add(arg);
        continue;
      }
    }
    tc_nodes.push(arg);
    op.add(new PopFromStack(stack));
  }
  if (!new_paths.length) {
    return new op.ResultType(op.run());
  }
  paths.push(...new_paths);
  if (!tc_nodes.length) { return op; }
  return new TypeCond(stack, tc_nodes, op);
};

export const buildObject = (paths: any[], expr: { [x: string]: any; }) => {
  const op_names: any = new Set(), fields = new Set();
  for (let field in expr) {
    (field[0] === '$' ? op_names : fields).add(field);
  }
  if (op_names.size > 1) {
    throw Error('objects cannot have more than one operator');
  }
  if (op_names.size) {
    for (let path of fields) {
      throw Error(`unexpected field '${path}'`);
    }
    for (let name of op_names) {
      if (name === '$literal') {
        return Value.literal(expr[name]);
      }
      return buildOp(paths, name, expr[name]);
    }
  }
  const new_paths = [], obj = {};
  for (let field in expr) {
    obj[field] = build(new_paths, expr[field]);
  }
  const node: any = new ObjectExpr(obj);
  if (!new_paths.length) {
    return new Value(node.run());
  }
  paths.push(...new_paths);
  return node;
};

export const build = (paths, expr) => {
  if (typeof expr === 'string' && expr[0] === '$') {
    const path = new Path(expr.substring(1));
    paths.push(path);
    return new Get(path);
  }
  if (expr == null || expr.constructor !== Object) {
    return Value.any(expr);
  }
  return buildObject(paths, expr);
};

export const expression = (expr) => {
  const paths = [], ast = build(paths, expr);
  return {
    ast,
    paths,
    has_refs: !!paths.length
  };
};

export default expression
