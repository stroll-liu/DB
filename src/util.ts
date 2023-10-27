import deepMerge from 'deepmerge'
import * as clone from 'clone'
import * as objectHash from 'object-hash'

export const toPathPieces = path => path.split('.');

const _exists = (obj, path_pieces) => {
  for (var i = 0; i < path_pieces.length - 1; i++) {
    const piece = path_pieces[i];
    if (!obj.hasOwnProperty(piece)) { return; }
    obj = obj[piece];
    if (!isObject(obj)) { return; }
  }
  if (obj.hasOwnProperty(path_pieces[i])) {
    return obj;
  }
};

export const exists = (obj, path_pieces) => {
  return !!_exists(obj, path_pieces);
};

export const create = (obj, path_pieces, i) => {
  for (let j = i; j < path_pieces.length - 1; j++) {
    obj[path_pieces[j]] = {};
    obj = obj[path_pieces[j]];
  }
  return obj;
};

export const get = (obj, path_pieces, fn) => {
  if (obj = _exists(obj, path_pieces)) {
    fn(obj, path_pieces[path_pieces.length - 1]);
  }
};

// 设置一个值，如果不存在则创建路径。
export const set = (obj, path_pieces, value) => {
  const fn = (obj, field) => obj[field] = value;
  modify(obj, path_pieces, fn, fn);
};

export const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null;
};

// 更新值或创建它及其路径（如果不存在）
export const modify = (obj, path_pieces, update, init) => {
  const last = path_pieces[path_pieces.length - 1];
  const _create = (i) => {
    obj = create(obj, path_pieces, i);
    init(obj, last);
  };

  if (!obj.hasOwnProperty(path_pieces[0])) {
    return _create(0);
  }

  if (path_pieces.length > 1) {
    obj = obj[path_pieces[0]];
    for (let i = 1; i < path_pieces.length - 1; i++) {
      const piece = path_pieces[i];
      if (!isObject(obj[piece])) { return; }
      if (Array.isArray(obj) && piece < 0) { return; }
      if (!obj.hasOwnProperty(piece)) {
        return _create(i);
      }
      obj = obj[piece];
    }
  }
  update(obj, last);
};

// 从对象中删除指定路径
export const remove1 = (obj, path_pieces) => {
  for (var i = 0; i < path_pieces.length - 1; i++) {
    obj = obj[path_pieces[i]];
    if (!isObject(obj)) { return; }
  }
  if (Array.isArray(obj)) {
    const index = Number.parseFloat(path_pieces[i]);
    if (Number.isInteger(index)) {
      obj.splice(index, 1);
    }
  } else { delete obj[path_pieces[i]]; }
};

const _remove2 = (obj, new_obj, paths) => {
  const fn = (field) => {
    const new_paths = [];
    for (let path_pieces of paths) {
      if (path_pieces[0] !== field) { continue; }
      if (path_pieces.length === 1) { return; }
      new_paths.push(path_pieces.slice(1));
    }
    if (!new_paths.length) {
      new_obj[field] = clone(obj[field]);
    } else {
      const value = obj[field];
      new_obj[field] = new value.constructor();
      _remove2(value, new_obj[field], new_paths);
    }
  };
  for (let field in obj) { fn(field); }
};

// 复制对象时忽略指定路径。
export const remove2 = (obj, paths) => {
  const new_obj = new obj.constructor();
  _remove2(obj, new_obj, paths);
  return new_obj;
};

export const rename = (obj1, path_pieces, new_name) => {
  get(obj1, path_pieces, (obj2, field) => {
    obj2[new_name] = obj2[field];
    delete obj2[field];
  });
};

// 通过忽略其他字段的路径复制对象。
const _copy = (obj, new_obj, path_pieces) => {
  for (var i = 0; i < path_pieces.length - 1; i++) {
    const piece = path_pieces[i];
    obj = obj[piece];
    if (!isObject(obj)) { return; }
    new_obj[piece] = new obj.constructor();
    new_obj = new_obj[piece];
  }
  if (obj.hasOwnProperty(path_pieces[i])) {
    new_obj[path_pieces[i]] = obj[path_pieces[i]];
    return obj;
  }
};

// 按指定路径复制对象，忽略其他路径。
export const copy = (obj, paths) => {
  let new_objs = [];
  for (let path_pieces of paths) {
    const new_obj = new obj.constructor();
    if (_copy(obj, new_obj, path_pieces)) {
      new_objs.push(new_obj);
    }
  }
  return new_objs.reduce(deepMerge, {});
};

export const equal = (value1, value2) => {
  return hashify(value1) === hashify(value2);
};

export const unknownOp = (name) => {
  throw Error(`unknown operator '${name}'`);
};

export const hashify = (value) => {
  if (value === undefined) { return; }
  return objectHash(value);
};

export const getIDBError = e => Error(e.target.error.message);

export default {
  toPathPieces,
  exists,
  create,
  get,
  set,
  isObject,
  modify,
  remove1,
  remove2,
  rename,
  copy,
  equal,
  unknownOp,
  hashify,
  getIDBError
}
