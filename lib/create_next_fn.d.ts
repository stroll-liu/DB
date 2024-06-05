export declare const toIDBDirection: (value: number) => "next" | "prev";
export declare const joinPredicates: (preds: string | any[]) => any;
export declare const removeClause: ({ parent, index }: any) => void;
export declare const openConn: ({ col, read_pref }: any, cb: any) => void;
export declare const getIDBReqWithIndex: (store: {
    index: (arg0: any) => any;
}, clause: {
    idb_key_range: null;
    idb_direction: string;
    path: {
        literal: any;
    };
}) => any;
export declare const getIDBReqWithoutIndex: (store: {
    openCursor: () => any;
}) => any;
export declare const buildPredicates: (pipeline: any) => any[][] | undefined;
export declare const initPredAndSortSpec: (config: {
    pred?: any;
    sort_spec?: any;
    pipeline?: any;
}) => void;
export declare const getClauses: (col: {
    _isIndexed: (arg0: any) => any;
}, pred: {
    getClauses: () => any;
}) => any[];
export declare const initSort: (config: {
    sort_spec: any;
    clauses: any;
    pipeline?: any;
}) => void;
export declare const createGetIDBReqFn: ({ pred, clauses, pipeline }: any) => ((store: {
    openCursor: () => any;
}) => any) | ((store: {
    index: (arg0: any) => any;
}) => any);
export declare const createGetIDBCurFn: (config: any) => (cb: any) => void;
export declare const addPipelineStages: ({ pipeline }: any, next: {
    (cb: any): void;
    (cb: any): void;
}) => {
    (cb: any): void;
    (cb: any): void;
};
export declare const createParallelNextFn: (config: {
    pred: {
        args: any;
    };
    col: any;
    read_pref: any;
    sort_spec: any;
    pipeline: any[][];
}) => (cb: any) => void;
export declare const createNextFn: (config: {
    col: any;
    read_pref: any;
    pred: any;
    pipeline: never[];
}) => (cb: any) => void;
export declare const createNext: (cur: any) => {
    (cb: any): void;
    (cb: any): void;
};
export default createNext;
