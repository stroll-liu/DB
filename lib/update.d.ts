export declare const ops: {
    [s: string]: any;
};
export declare const modifyOp: (path_pieces: any, update: any, init: any) => (doc: any) => void;
export declare const arithOp: (fn: {
    (a: any, b: any): any;
    (a: any, b: any): number;
    (arg0: any, arg1: number): any;
}) => (path_pieces: any, value1: any) => (doc: any) => void;
export declare const compareOp: (fn: {
    (a: any, b: any): boolean;
    (a: any, b: any): boolean;
    (arg0: any, arg1: any): any;
}) => (path_pieces: any, value: any) => (doc: any) => void;
export declare const build: (steps: any[], field: any, value: {
    [x: string]: any;
}) => number | undefined;
export declare const update: (cur: any, spec: any, cb: any) => any;
export default update;
