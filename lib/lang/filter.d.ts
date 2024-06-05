export declare const isIndexMatchable: (value: any) => boolean;
export declare class Operator {
    _is_index_matchable: any;
    getClauses(): this[];
}
export declare class Connective extends Operator {
    args: any;
    constructor(args: any);
}
export declare class Conjunction extends Connective {
    getClauses(): any[];
    run(fields: any): boolean;
}
export declare class Disjunction extends Connective {
    getClauses(): never[];
    run(fields: any): boolean;
}
export declare class Negation extends Conjunction {
    getClauses(): never[];
    run(fields: any): boolean;
}
export declare class Exists extends Operator {
    path: any;
    bool: any;
    constructor(path: any, bool: any);
    get is_index_matchable(): boolean;
    run(fields: any): boolean;
}
export declare class Equal extends Operator {
    path: any;
    value: any;
    constructor(path: any, value: any);
    get is_index_matchable(): boolean;
    get idb_key_range(): any;
    run(fields: any): boolean;
}
export declare class NotEqual extends Equal {
    get is_index_matchable(): boolean;
    run(fields: any): boolean;
}
export declare class Range extends Operator {
    path: any;
    fns: any;
    values: any;
    constructor(path: any, fns: any, values: any);
    get is_index_matchable(): boolean;
    run(fields: any): boolean;
}
export declare const rangeMixin: (...fns: any) => {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare const gt: (a: any, b: any) => boolean, gte: (a: any, b: any) => boolean, lt: (a: any, b: any) => boolean, lte: (a: any, b: any) => boolean;
declare const Gt_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class Gt extends Gt_base {
    values: any;
    get idb_key_range(): any;
}
declare const Gte_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class Gte extends Gte_base {
    values: any;
    get idb_key_range(): any;
}
declare const Lt_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class Lt extends Lt_base {
    values: any;
    get idb_key_range(): any;
}
declare const Lte_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class Lte extends Lte_base {
    values: any;
    get idb_key_range(): any;
}
declare const GtLt_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class GtLt extends GtLt_base {
    values: any;
    get idb_key_range(): any;
}
declare const GteLt_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class GteLt extends GteLt_base {
    values: any;
    get idb_key_range(): any;
}
declare const GtLte_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class GtLte extends GtLte_base {
    values: any;
    get idb_key_range(): any;
}
declare const GteLte_base: {
    new (path: any, values: any): {
        path: any;
        fns: any;
        values: any;
        readonly is_index_matchable: boolean;
        run(fields: any): boolean;
        _is_index_matchable: any;
        getClauses(): any[];
    };
};
export declare class GteLte extends GteLte_base {
    values: any;
    get idb_key_range(): any;
}
export declare class ElemMatch extends Operator {
    path: any;
    op: any;
    constructor(path: any, op: any);
    get is_index_matchable(): boolean;
    run(fields: any): boolean;
}
export declare class RegEx extends Operator {
    path: any;
    expr: any;
    constructor(path: any, expr: any);
    get is_index_matchable(): boolean;
    run(fields: any): any;
}
export declare const $and: (parent_args: any, args: any) => boolean;
export declare const $or: (parent_args: any, args: any) => boolean;
export declare const $not: (parent_args: any, args: any) => boolean;
export declare const connectives: any;
export declare const ranges: any;
export declare const buildRange: (new_args: any, path: any, params: any, op_keys: any) => true | undefined;
export declare const buildClause: (parent_args: any, path: any, params: any) => boolean;
export declare const build: (expr: any) => any;
declare const _default: {
    build: (expr: any) => any;
    Conjunction: typeof Conjunction;
    Disjunction: typeof Disjunction;
    Exists: typeof Exists;
};
export default _default;
