export declare const toPathPieces: (path: string) => string[];
export declare const exists: (obj: any, path_pieces: any) => boolean;
export declare const create: (obj: {
    [x: string]: any;
    hasOwnProperty?: (arg0: any) => any;
}, path_pieces: string | any[], i: number) => {
    [x: string]: any;
    hasOwnProperty?: ((arg0: any) => any) | undefined;
};
export declare const get: (obj: any, path_pieces: string | any[], fn: {
    (obj2: {
        [x: string]: any;
    }, field: string | number): void;
    (obj: any, field: any): void;
    (obj: any, field: any): void;
    (obj: {
        [x: string]: any;
    }, field: string | number): void;
    (obj: {
        [x: string]: any[];
    }, field: string | number): void;
    (obj: {
        [x: string]: any;
    }, field: string | number): void;
    (arg0: any, arg1: any): void;
}) => void;
export declare const set: (obj: any, path_pieces: any, value?: any) => void;
export declare const isObject: (obj: any[] | null) => boolean;
export declare const modify: (obj: any, path_pieces: any, update: {
    (obj: any, field: any): any;
    (obj: any, field: any): void;
    (obj: any, field: any): void;
    (obj: any, field: any): void;
    (arg0: any, arg1: any): void;
}, init: {
    (obj: any, field: any): any;
    (obj: any, field: any): number;
    (obj: any, field: any): any;
    (obj: any, field: any): any[];
    (arg0: any, arg1: any): void;
}) => void;
export declare const remove1: (obj: any, path_pieces: string | any[]) => void;
export declare const remove2: (obj: {
    constructor: new () => any;
}, paths: any) => any;
export declare const rename: (obj1: any, path_pieces: any, new_name: string | number) => void;
export declare const copy: (obj: {
    constructor: new () => any;
}, paths: any) => any;
export declare const equal: (value1: undefined, value2: undefined) => boolean;
export declare const unknownOp: (name: string) => never;
export declare const hashify: (value: undefined) => string;
export declare const getIDBError: (e: {
    target: {
        error: {
            message: string | undefined;
        };
    };
}) => Error;
declare const _default: {
    toPathPieces: (path: string) => string[];
    exists: (obj: any, path_pieces: any) => boolean;
    create: (obj: {
        [x: string]: any;
        hasOwnProperty?: ((arg0: any) => any) | undefined;
    }, path_pieces: string | any[], i: number) => {
        [x: string]: any;
        hasOwnProperty?: ((arg0: any) => any) | undefined;
    };
    get: (obj: any, path_pieces: string | any[], fn: {
        (obj2: {
            [x: string]: any;
        }, field: string | number): void;
        (obj: any, field: any): void;
        (obj: any, field: any): void;
        (obj: {
            [x: string]: any;
        }, field: string | number): void;
        (obj: {
            [x: string]: any[];
        }, field: string | number): void;
        (obj: {
            [x: string]: any;
        }, field: string | number): void;
        (arg0: any, arg1: any): void;
    }) => void;
    set: (obj: any, path_pieces: any, value?: any) => void;
    isObject: (obj: any[] | null) => boolean;
    modify: (obj: any, path_pieces: any, update: {
        (obj: any, field: any): any;
        (obj: any, field: any): void;
        (obj: any, field: any): void;
        (obj: any, field: any): void;
        (arg0: any, arg1: any): void;
    }, init: {
        (obj: any, field: any): any;
        (obj: any, field: any): number;
        (obj: any, field: any): any;
        (obj: any, field: any): any[];
        (arg0: any, arg1: any): void;
    }) => void;
    remove1: (obj: any, path_pieces: string | any[]) => void;
    remove2: (obj: {
        constructor: new () => any;
    }, paths: any) => any;
    rename: (obj1: any, path_pieces: any, new_name: string | number) => void;
    copy: (obj: {
        constructor: new () => any;
    }, paths: any) => any;
    equal: (value1: undefined, value2: undefined) => boolean;
    unknownOp: (name: string) => never;
    hashify: (value: undefined) => string;
    getIDBError: (e: {
        target: {
            error: {
                message: string | undefined;
            };
        };
    }) => Error;
};
export default _default;
