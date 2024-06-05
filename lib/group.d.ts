export declare class Operator {
    _value: any;
    get value(): any;
    static getNoRefsSteps(steps: any): any;
    static getOpValue(expr: any, cb: any): void;
    getOpValueWithRefs(expr: any, doc: any, cb: any): void;
}
export declare class Sum extends Operator {
    constructor();
    static _verify(value: any, cb: any): void;
    static getOpValue(expr: any, cb: any): void;
    getOpValueWithRefs(expr: any, doc: any, cb: any): void;
    add(value: any): void;
}
export declare class Avg extends Sum {
    private _count;
    constructor();
    add(value: any): void;
    get value(): number;
}
export declare class Compare extends Operator {
    private _fn;
    private _add;
    constructor(fn: any);
    static getNoRefsSteps(steps: any): any;
    _add1(value: any): void;
    _add2(new_value: any): void;
    add(value: any): void;
}
export declare class Min extends Compare {
    constructor();
}
export declare class Max extends Compare {
    constructor();
}
export declare class Push extends Operator {
    constructor();
    add(value: any): void;
}
export declare class AddToSet extends Operator {
    private _hashes;
    constructor();
    static getNoRefsSteps(steps: any): any;
    add(value: any): void;
    get value(): any[];
}
export declare const runSteps: (steps: any, ...args: any) => void;
export declare const runInEnd: (in_end: any, groups: any) => void;
export declare const groupLoopFn: (next: any, in_end: any, groups: any, fn: any) => (cb: any) => void;
export declare const createGroupByRefFn: (next: any, expr: any, steps: any) => (cb: any) => void;
export declare const createGroupFn: (next: any, expr: any, steps: any) => (cb: any) => void;
export declare const ops: any;
export declare const group: (_next: any, spec: any) => (cb: any) => void;
export default group;
