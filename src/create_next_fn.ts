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

export const toIDBDirection = value => value > 0 ? 'next' : 'prev';

export const joinPredicates = (preds) => {
  if (preds.length > 1) {
    return new Conjunction(preds);
  }
  return preds[0];
};

export const removeClause = ({ parent, index }) => {
  parent.args.splice(index, 1);
};

export const openConn = ({ col, read_pref }, cb) => {
  col._db._getConn((error, idb) => {
    if (error) { return cb(error); }
    const name = col._name;
    try {
      const trans = idb.transaction([name], read_pref);
      trans.onerror = e => cb(getIDBError(e));
      cb(null, trans.objectStore(name));
    } catch (error) { cb(error); }
  });
};

export const getIDBReqWithIndex = (store, clause) => {
  const key_range = clause.idb_key_range || null
  const direction = clause.idb_direction || 'next'
  const { literal } = clause.path;
  let index;
  if (literal === '_id') { index = store; }
  else { index = store.index(literal); }
  return index.openCursor(key_range, direction);
};

export const getIDBReqWithoutIndex = store => store.openCursor();

export const buildPredicates = (pipeline) => {
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

export const initPredAndSortSpec = (config) => {
  const { pipeline } = config,
    preds = [],
    sort_specs = [];
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

export const getClauses = (col, pred) => {
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

const initClauses = (config) => {
  const { col, pred } = config;
  config.clauses = getClauses(col, pred);
};

const initHint = (config) => {
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

export const initSort = (config) => {
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

export const createGetIDBReqFn = ({ pred, clauses, pipeline }) => {
  let getIDBReq;
  if (clauses.length) {
    const clause = clauses[0];
    getIDBReq = store => getIDBReqWithIndex(store, clause);
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

export const createGetIDBCurFn = (config) => {
  let idb_cur, idb_req;
  const getIDBReq = createGetIDBReqFn(config);
  const onIDBCur = (cb) => {
    idb_req.onsuccess = (e) => {
      idb_cur = e.target.result;
      cb();
    };
    idb_req.onerror = e => cb(getIDBError(e));
  };
  const progressCur = (cb) => {
    onIDBCur(cb);
    idb_cur.continue();
  };
  let getCur = (cb) => {
    openConn(config, (error, store) => {
      if (error) { return cb(error); }
      idb_req = getIDBReq(store);
      onIDBCur((error) => {
        if (idb_cur) { getCur = progressCur; }
        cb(error);
      });
    });
  };
  return cb => getCur(error => cb(error, idb_cur));
};

export const addPipelineStages = ({ pipeline }, next) => {
  for (let [fn, arg] of pipeline) {
    next = fn(next, arg);
  }
  return next;
};

export const createParallelNextFn = (config) => {
  const next_fns = [], pred_args = config.pred.args;
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
  const onDoc = (doc) => {
    const _id_hash = hashify(doc._id);
    if (!_id_hashes.has(_id_hash)) {
      return _id_hashes.add(_id_hash);
    }
  };
  const getNextFn = () => next_fns.pop();
  let currentNextFn = getNextFn();
  const changeNextFn = (cb) => {
    if (currentNextFn = getNextFn()) { next(cb); }
    else { cb(); }
  };
  const next = (cb) => {
    currentNextFn((error, doc, idb_cur) => {
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

export const createNextFn = (config) => {
  const getIDBCur = createGetIDBCurFn(config);
  const next = (cb) => {
    getIDBCur((error, idb_cur) => {
      if (!idb_cur) { cb(error); }
      else { cb(null, idb_cur.value, idb_cur); }
    });
  };
  return next;
};

export const createNext = (cur) => {
  let pipeline;
  try { pipeline = buildPredicates(cur._pipeline); }
  catch (error) { return cb => cb(error); }
  if (!pipeline) { return cb => cb(); }
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
