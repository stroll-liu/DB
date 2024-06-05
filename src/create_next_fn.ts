import merge from 'deepmerge'

import { hashify, getIDBError } from './util'
import filter from './filter'
import sort from './sort'

import {
  build,
  Conjunction,
  Disjunction,
  Exists
} from './lang/filter'

export const toIDBDirection = (value: number) => value > 0 ? 'next' : 'prev';

export const joinPredicates = (preds: string | any[]) => {
  if (preds.length > 1) {
    return new Conjunction(preds);
  }
  return preds[0];
};

export const removeClause = ({ parent, index }: any) => {
  parent.args.splice(index, 1);
};

export const openConn = ({ col, read_pref }: any, cb: any) => {
  col._db._getConn((error: any, idb: { transaction: (arg0: any[], arg1: any) => any }) => {
    if (error) { return cb(error); }
    const name = col._name;
    try {
      const trans = idb.transaction([name], read_pref);
      trans.onerror = (e: any) => cb(getIDBError(e));
      cb(null, trans.objectStore(name));
    } catch (error) { cb(error); }
  });
};

export const getIDBReqWithIndex = (store: { index: (arg0: any) => any }, clause: { idb_key_range: null; idb_direction: string; path: { literal: any } }) => {
  const key_range = clause.idb_key_range || null
  const direction = clause.idb_direction || 'next'
  const { literal } = clause.path;
  let index;
  if (literal === '_id') { index = store; }
  else { index = store.index(literal); }
  return index.openCursor(key_range, direction);
};

export const getIDBReqWithoutIndex = (store: { openCursor: () => any }) => store.openCursor();

export const buildPredicates = (pipeline: any) => {
  const new_pipeline = [];
  for (let [fn, arg] of pipeline) {
    if (fn === filter) {
      const pred = build(arg);
      if (pred === false) { return; }
      if (!pred) { continue; }
      arg = pred;
    }
    new_pipeline.push([fn, arg]);
  }
  return new_pipeline;
};

export const initPredAndSortSpec = (config: { pred?: any; sort_spec?: any; pipeline?: any }) => {
  const { pipeline } = config,
    preds = [],
    sort_specs: any = [];
  let i = 0;
  for (let [fn, arg] of pipeline) {
    if (fn === sort) { sort_specs.push(arg); }
    else if (fn === filter) { preds.push(arg); }
    else { break; }
    i++;
  }
  pipeline.splice(0, i);
  config.pred = joinPredicates(preds);
  if (sort_specs.length) {
    config.sort_spec = sort_specs.reduce(merge, {});
  }
};

export const getClauses = (col: { _isIndexed: (arg0: any) => any }, pred: { getClauses: () => any }) => {
  if (!pred) { return []; }
  const clauses = [], exists_clauses = [];
  for (let clause of pred.getClauses()) {
    if (col._isIndexed(clause.path.literal)) {
      if (clause instanceof Exists) {
        exists_clauses.push(clause);
      } else { clauses.push(clause); }
    }
  }
  if (clauses.length) { return clauses; }
  return exists_clauses;
};

const initClauses = (config: { col?: any; read_pref?: any; pred?: any; pipeline?: never[]; clauses?: any }) => {
  const { col, pred } = config;
  config.clauses = getClauses(col, pred);
};

const initHint = (config: { hint: any; clauses: any }) => {
  if (!config.hint) { return; }
  const { clauses, hint } = config;
  let new_clauses = [];
  for (let clause of clauses) {
    if (clause.path.literal === hint) {
      new_clauses.push(clause);
    }
  }
  if (!new_clauses.length) {
    new_clauses = [{ path: { literal: hint } }];
  }
  config.clauses = new_clauses;
};

export const initSort = (config: { sort_spec: any; clauses: any; pipeline?: any }) => {
  if (!config.sort_spec) { return; }
  const { clauses, sort_spec: spec, pipeline } = config;
  const new_clauses = [];
  for (let clause of clauses) {
    const { literal } = clause.path;
    if (!spec.hasOwnProperty(literal)) { continue; }
    const order = spec[literal];
    clause.idb_direction = toIDBDirection(order);
    new_clauses.push(clause);
  }
  if (new_clauses.length) {
    config.clauses = new_clauses;
  } else {
    pipeline.unshift([sort, spec]);
  }
};

export const createGetIDBReqFn = ({ pred, clauses, pipeline }: any) => {
  let getIDBReq;
  if (clauses.length) {
    const clause = clauses[0];
    getIDBReq = (store: { index: (arg0: any) => any }) => getIDBReqWithIndex(store, clause);
    if (!pred || clause === pred) {
      return getIDBReq;
    }
    removeClause(clause);
  } else {
    getIDBReq = getIDBReqWithoutIndex;
    if (!pred) { return getIDBReq; }
  }
  pipeline.unshift([filter, pred]);
  return getIDBReq;
};

export const createGetIDBCurFn = (config: any) => {
  let idb_cur: { continue: () => void }, idb_req: { onsuccess: (e: any) => void; onerror: (e: any) => any };
  const getIDBReq = createGetIDBReqFn(config);
  const onIDBCur = (cb: any) => {
    idb_req.onsuccess = (e) => {
      idb_cur = e.target.result;
      cb();
    };
    idb_req.onerror = e => cb(getIDBError(e));
  };
  const progressCur = (cb: any) => {
    onIDBCur(cb);
    idb_cur.continue();
  };
  let getCur = (cb: any) => {
    openConn(config, (error: any, store: { index: (arg0: any) => any } & { openCursor: () => any }) => {
      if (error) { return cb(error); }
      idb_req = getIDBReq(store);
      onIDBCur((error: any) => {
        if (idb_cur) { getCur = progressCur; }
        cb(error);
      });
    });
  };
  return (cb: any) => getCur((error: any) => cb(error, idb_cur));
};

export const addPipelineStages = ({ pipeline }: any, next: { (cb: any): void; (cb: any): void }) => {
  for (let [fn, arg] of pipeline) {
    next = fn(next, arg);
  }
  return next;
};

export const createParallelNextFn = (config: { pred: { args: any }; col: any; read_pref: any; sort_spec: any; pipeline: any[][] }) => {
  const next_fns: any = [], pred_args = config.pred.args;
  for (let i = pred_args.length - 1; i >= 0; i--) {
    const new_config = {
      col: config.col,
      read_pref: config.read_pref,
      pred: pred_args[i],
      pipeline: []
    };
    initClauses(new_config);
    const next = createNextFn(new_config);
    next_fns.push(addPipelineStages(new_config, next));
  }
  const _id_hashes = new Set();
  const onDoc = (doc: { _id: any }) => {
    const _id_hash = hashify(doc._id);
    if (!_id_hashes.has(_id_hash)) {
      return _id_hashes.add(_id_hash);
    }
  };
  const getNextFn = () => next_fns.pop();
  let currentNextFn = getNextFn();
  const changeNextFn = (cb: any) => {
    if (currentNextFn = getNextFn()) { next(cb); }
    else { cb(); }
  };
  const next = (cb: any) => {
    currentNextFn((error: any, doc: { _id: any }, idb_cur: any) => {
      if (error) { cb(error); }
      else if (!doc) { changeNextFn(cb); }
      else if (onDoc(doc)) {
        cb(null, doc, idb_cur);
      } else { next(cb); }
    });
  };
  const spec = config.sort_spec;
  if (spec) { config.pipeline.push([sort, spec]); }
  return next;
};

export const createNextFn = (config: { col: any; read_pref: any; pred: any; pipeline: never[] }) => {
  const getIDBCur = createGetIDBCurFn(config);
  const next = (cb: any) => {
    getIDBCur((error: null, idb_cur: { value: undefined } | undefined) => {
      if (!idb_cur) { cb(error); }
      else { cb(null, idb_cur.value, idb_cur); }
    });
  };
  return next;
};

export const createNext = (cur: any) => {
  let pipeline;
  try { pipeline = buildPredicates(cur._pipeline); }
  catch (error) { return (cb: any) => cb(error); }
  if (!pipeline) { return (cb: any) => cb(); }
  const config: any = {
    col: cur._col,
    read_pref: cur._read_pref,
    hint: cur._hint,
    pipeline
  };
  initPredAndSortSpec(config);
  let next;
  if (config.pred instanceof Disjunction) {
    next = createParallelNextFn(config);
  } else {
    initClauses(config);
    initHint(config);
    initSort(config);
    next = createNextFn(config);
  }
  return addPipelineStages(config, next);
};

export default createNext
