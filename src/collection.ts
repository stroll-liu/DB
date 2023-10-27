import { getIDBError } from './util'
import Cursor from './cursor'
import aggregate from './aggregate'
import update from './update'
import remove from './remove'

/** 代表集合的类。 */
class Collection {
  private _db: any
  private _name: string
  private _indexes: Set<unknown>
  /** <strong>注意:</strong> 不要直接实例化. */
  constructor(db: any, name: string) {
    this._db = db;
    this._name = name;
    this._indexes = new Set();
  }

  /**
   * 集合的名称。
   * @type {string}
   */
  get name() { return this._name; }

  _isIndexed(path) {
    return this._indexes.has(path) || path === '_id';
  }

  /**
   * 打开满足指定查询条件的游标。
   * @param {object} [expr] 用于过滤的查询文档。
   * @param {object} [projection_spec] 投影规范。
   * @return {Promise} Promise<Cursor>
   *
   * @example
   * col.find({ x: 4, g: { $lt: 10 } }, { k: 0 }).then((res) => {
   *    console.log(res)
   * });
   */
  find(expr, projection_spec): Promise<Cursor> {
    return new Promise((resolve, reject) => {
      try {
        const cur = new Cursor(this, 'readonly');
        cur.filter(expr);
        if (projection_spec) cur.project(projection_spec);
        resolve(cur)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 检索满足指定查询条件的一份文档。
   * @param {object} [expr] 用于过滤的查询文档。
   * @param {object} [projection_spec] 投影规范。
   * @return {Promise} Promise<unknown>
   *
   * @example
   * col.findOne({ x: 4, g: { $lt: 10 } }, { k: 0 }).then((res) => {
   *    console.log(res)
   * });
   */
  async findOne(expr, projection_spec): Promise<unknown|Error> {
    const cur = await this.find(expr, projection_spec).then((cur) => {
      return cur.limit(1)
    })
    return cur.toArray();
  }

  /**
   * 评估聚合框架管道。
   * @param {object[]} pipeline 管道。
   * @return {Promise} Promise<Cursor|Error>
   *
   * @example
   * col.aggregate([
   *     { $match: { x: { $lt: 8 } } },
   *     { $group: { _id: '$x', array: { $push: '$y' } } },
   *     { $unwind: '$array' }
   * ]);
   */
  aggregate(pipeline): Promise<Cursor> { return aggregate(this, pipeline); }

  _validate(doc) {
    for (let field in doc) {
      if (field[0] === '$') {
        throw Error("字段名称不能以以下内容开头 '$'");
      }
      const value = doc[field];
      if (Array.isArray(value)) {
        for (let element of value) {
          this._validate(element);
        }
      } else if (typeof value === 'object') {
        this._validate(value);
      }
    }
  }

  /**
   * @param {object|object[]} docs 要插入的文档。
   * @return {Promise}
   *
   * @example
   * col.insert([{ x: 4 }, { k: 8 }]).then((res) => {
   *    console.log(res)
   * });
   *
   * @example
   * col.insert({ x: 4 }).then((res) => {
   *    console.log(res)
   * });
   */
  insert(docs): Promise<unknown> {
    if (!Array.isArray(docs)) { docs = [docs]; }
    return new Promise((resolve, reject) => {
      this._db._getConn((error, idb) => {
        let trans;
        const name = this._name;
        try { trans = idb.transaction([name], 'readwrite'); }
        catch (error) { return reject(error); }
        trans.oncomplete = () => resolve(true);
        trans.onerror = e => reject(getIDBError(e));
        const store = trans.objectStore(name);
        let i = 0;
        const iterate = () => {
          const doc = docs[i];
          try { this._validate(doc); }
          catch (error) { return reject(error); }
          const req = store.add(doc);
          req.onsuccess = () => {
            i++;
            if (i < docs.length) { iterate(); }
          };
        };
        iterate();
      });
    })
  }

  _modify(fn, expr) {
    return new Promise((resolve, reject) => {
      const cur = new Cursor(this, 'readwrite');
      cur.filter(expr);
      fn(cur, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    })
  }

  /**
   * 更新与过滤器匹配的文档。
   * @param {object} expr 用于过滤的查询文档。
   * @param {object} spec 更新规范。
   * @param {function} [cb] 结果回调。
   * @return {Promise}
   *
   * @example
   * col.update({
   *     age: { $gte: 18 }
   * }, {
   *     adult: true
   * }, (error) => {
   *     if (error) { throw error; }
   * });
   */
  update(expr, spec) {
    const fn = (cur, cb) => update(cur, spec, cb);
    return this._modify(fn, expr);
  }

  /**
   * 删除与过滤器匹配的文档。
   * @param {object} expr 用于过滤的查询文档。
   * @param {function} [cb] 结果回调。
   * @return {Promise}
   *
   * @example
   * col.remove({ x: { $ne: 10 } }, (error) => {
   *     if (error) { throw error; }
   * });
   */
  remove(expr) {
    return this._modify(remove, expr);
  }
}

module.exports = Collection;
