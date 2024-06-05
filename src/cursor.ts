import {EventEmitter} from 'events'

import createNextFn from './create_next_fn'
import filter from './filter'
import project from './project'
import group from './group'
import unwind from './unwind'
import sort from './sort'
import skip from './skip'
import limit from './limit'

/**
 * Cursor 数据事件。
 * @event Cursor#data
 * @type {object}
 */

/**
 * Cursor 结束事件。
 * @event Cursor#end
 */

/**
 * 表示查询游标的类。
 * <strong>注意:</strong> 有 filter, limit, skip, project, group,
 * 展开和排序方法每个都会向 cursor 管道添加一个附加阶段，
 * 因此不会覆盖任何先前的调用.
 */
export class Cursor extends EventEmitter {
  private _col: any
  private _read_pref: any
  private _pipeline: any[]
  private _next: (cb: any) => void
  private _opened: any
  private _hint: any
  /** <strong>注意:</strong> 不要直接实例化. */
  constructor(col: any, read_pref: string) {
    super();

    this._col = col;
    this._read_pref = read_pref;
    this._pipeline = [];
    this._next = this._init;
  }

  _forEach(fn: any, cb: any) {
    this._next((error: any, doc: any) => {
      if (doc) {
        fn(doc);
        this.emit('forEachData', doc);
        this._forEach(fn, cb);
      } else {
        this.emit('forEachEnd');
        cb(error);
      }
    });
  }

  /**
   * 迭代每个文档并应用一个函数。
   * @param {function} [fn] 应用于每个文档的函数.
   * @returns {Promise} Promise<unknown>
   * @example
   * col.find().forEach((doc) => {
   *     console.log('doc:', doc);
   * }).then((doc) => {
   *  console.log(docs)
   * });
   */
  forEach(fn = (doc: any) => { }): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const docs: any = []
      this._forEach((doc: any) => {
        fn(doc)
        docs.push(doc)
      }, (error: any) => {
        if (error) reject(error)
      });
      this.on('forEachEnd', () => {
        resolve(docs)
      })
    })
  }

  _toArray(cb: any) {
    const docs: any = [];
    this._forEach((doc: any) => {
      docs.push(doc);
    }, (error: any) => cb(error, docs));
  }

  /**
   * 将所有文档收集为数组。
   * @return {Promise} Promise<unknown>
   * @example
   * col.find().toArray().then((docs) => {
   *    console.log(docs)
   * });
   */
  toArray(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this._toArray((error: any, docs: unknown) => {
        if (error) reject(error);
        else resolve(docs);
      });
    })
  }

  _assertUnopened() {
    if (this._opened) {
      throw Error('cursor has already been opened');
    }
  }

  /**
   * Suggest an index to use.
   * <strong>Note:</strong> When an index hint is used only documents
   * that contain the indexed path will be in the results.
   * @param {string} path An indexed path to use.
   * @return {Cursor}
   *
   * @example
   * col.find().hint('myindex');
   */
  hint(path: any) {
    this._assertUnopened();
    if (!this._col._isIndexed(path)) {
      throw Error(`index '${path}' does not exist`);
    }
    this._hint = path;
    return this;
  }
  _addStage(fn: any, arg: any) {
    this._assertUnopened();
    this._pipeline.push([fn, arg]);
    return this;
  }

  /**
   * Filter documents.
   * @param {object} expr The query document to filter by.
   * @return {Cursor}
   *
   * @example
   * col.find().filter({ x: 4 });
   */
  filter(expr: any) { return this._addStage(filter, expr); }

  /**
   * Limit the number of documents that can be iterated.
   * @param {number} num The limit.
   * @return {Cursor}
   *
   * @example
   * col.find().limit(10);
   */
  limit(num: any) { return this._addStage(limit, num); }

  /**
   * Skip over a specified number of documents.
   * @param {number} num The number of documents to skip.
   * @return {Cursor}
   *
   * @example
   * col.find().skip(4);
   */
  skip(num: any) { return this._addStage(skip, num); }

  /**
   * Add new fields, and include or exclude pre-existing fields.
   * @param {object} spec Specification for projection.
   * @return {Cursor}
   *
   * @example
   * col.find().project({ _id: 0, x: 1, n: { $add: ['$k', 4] } });
   */
  project(spec: any) { return this._addStage(project, spec); }

  /**
   * Group documents by an _id and optionally add computed fields.
   * @param {object} spec Specification for grouping documents.
   * @return {Cursor}
   *
   * @example
   * col.find().group({
   *     _id: '$author',
   *     books: { $push: '$book' },
   *     count: { $sum: 1 }
   * });
   */
  group(spec: any) { return this._addStage(group, spec); }

  /**
   * Deconstruct an iterable and output a document for each element.
   * @param {string} path A path to an iterable to unwind.
   * @return {Cursor}
   *
   * @example
   * col.find().unwind('$elements');
   */
  unwind(path: any) { return this._addStage(unwind, path); }

  /**
   * Sort documents.
   * <strong>Note:</strong> An index will not be used for sorting
   * unless the query predicate references one of the fields to
   * sort by or {@link Cursor#hint} is used. This is so as not to exclude
   * documents that do not contain the indexed field, in accordance
   * with the functionality of MongoDB.
   * @param {object} spec Specification for sorting.
   * @return {Cursor}
   *
   * @example
   * // No indexes will be used for sorting.
   * col.find().sort({ x: 1 });
   *
   * @example
   * // If x is indexed, it will be used for sorting.
   * col.find({ x: { $gt: 4 } }).sort({ x: 1 });
   *
   * @example
   * // If x is indexed, it will be used for sorting.
   * col.find().sort({ x: 1 }).hint('x');
   */
  sort(spec: any) { return this._addStage(sort, spec); }

  _init(cb: any) {
    this._opened = true;
    this._next = createNextFn(this);
    this._next(cb);
  }
}

export default Cursor;
