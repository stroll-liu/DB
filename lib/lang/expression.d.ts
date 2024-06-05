export declare class Value {
    value: any;
    constructor(value: any);
    get ResultType(): Function;
    static any(value: any): Value;
    static literal(value: any): Literal;
    run(fields: any): any;
}
export declare class NumberValue extends Value {
    static isType(value: any): boolean;
}
export declare class StringValue extends Value {
    static isType(value: any): boolean;
}
export declare class ArrayValue extends Value {
    static isType(value: any): boolean;
}
export declare class DateValue extends Value {
    static isType(value: any): boolean;
}
export declare class Literal extends Value {
    get ResultType(): any;
    run(): any;
}
export declare class Get {
    path: any;
    constructor(path: any);
    run(fields: any): any;
}
export declare class ObjectExpr extends Value {
    run(fields: any): any;
}
export declare class Operator {
    args: any[];
    constructor();
    get alt(): Value;
    add(node: any): void;
}
export declare class FnOp extends Operator {
    fn: any;
    constructor(fn: any);
    get length(): number;
    run(fields: any): any;
}
export declare class UnaryFnOp extends FnOp {
    get length(): number;
    run(fields: any): any;
}
export declare const fnOp: (Parent: any, fn: any) => {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare const opTypes: (Parent: any, InputType: any, ResultType?: any) => {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
declare const ArithOp_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class ArithOp extends ArithOp_base {
}
export declare const arithOp: (fn: any) => {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
declare const Add_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Add extends Add_base {
}
declare const Subtract_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Subtract extends Subtract_base {
}
declare const Multiply_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Multiply extends Multiply_base {
}
declare const Divide_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Divide extends Divide_base {
}
declare const Mod_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Mod extends Mod_base {
}
declare const MathOp_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class MathOp extends MathOp_base {
    get length(): any;
    run(fields: any): any;
}
export declare const mathOp: (fn: any) => {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
declare const Abs_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Abs extends Abs_base {
}
declare const Ceil_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Ceil extends Ceil_base {
}
declare const Floor_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Floor extends Floor_base {
}
declare const Ln_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Ln extends Ln_base {
}
declare const Log10_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Log10 extends Log10_base {
}
declare const Pow_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Pow extends Pow_base {
}
declare const Sqrt_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Sqrt extends Sqrt_base {
}
declare const Trunc_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Trunc extends Trunc_base {
}
declare const StringConcatOp_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class StringConcatOp extends StringConcatOp_base {
}
declare const Concat_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Concat extends Concat_base {
}
declare const CaseOp_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class CaseOp extends CaseOp_base {
    get alt(): StringValue;
}
declare const ToLower_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class ToLower extends ToLower_base {
}
declare const ToUpper_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class ToUpper extends ToUpper_base {
}
declare const ConcatArraysOp_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class ConcatArraysOp extends ConcatArraysOp_base {
}
declare const ConcatArrays_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class ConcatArrays extends ConcatArrays_base {
}
declare const DateOp_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class DateOp extends DateOp_base {
}
export declare const dateOp: (fn: any) => {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
declare const DayOfMonth_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class DayOfMonth extends DayOfMonth_base {
}
declare const Year_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Year extends Year_base {
}
declare const Month_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Month extends Month_base {
}
declare const Hour_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Hour extends Hour_base {
}
declare const Minute_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Minute extends Minute_base {
}
declare const Second_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Second extends Second_base {
}
declare const Millisecond_base: {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export declare class Millisecond extends Millisecond_base {
}
export declare class TypeCond {
    result_types: Set<any>;
    stack: any;
    isType: any;
    args: any;
    op: any;
    alt_value: any;
    constructor(stack: any, args: any, op: any);
    run(fields: any): any;
}
export declare class PopFromStack {
    stack: any;
    constructor(stack: any);
    run(): any;
}
export declare const ops: any;
export declare const buildOp: any;
export declare const buildObject: (paths: any[], expr: {
    [x: string]: any;
}) => any;
export declare const build: (paths: any, expr: any) => any;
export declare const expression: (expr: any) => {
    ast: any;
    paths: any;
    has_refs: boolean;
};
export default expression;
