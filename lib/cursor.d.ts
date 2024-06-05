/// <reference types="node" />
import { EventEmitter } from 'events';
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
export declare class Cursor extends EventEmitter {
    private _col;
    private _read_pref;
    private _pipeline;
    private _next;
    private _opened;
    private _hint;
    /** <strong>注意:</strong> 不要直接实例化. */
    constructor(col: any, read_pref: string);
    _forEach(fn: any, cb: any): void;
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
    forEach(fn?: (doc: any) => void): Promise<unknown>;
    _toArray(cb: any): void;
    /**
     * 将所有文档收集为数组。
     * @return {Promise} Promise<unknown>
     * @example
     * col.find().toArray().then((docs) => {
     *    console.log(docs)
     * });
     */
    toArray(): Promise<unknown>;
    _assertUnopened(): void;
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
    hint(path: any): this;
    _addStage(fn: any, arg: any): this;
    /**
     * Filter documents.
     * @param {object} expr The query document to filter by.
     * @return {Cursor}
     *
     * @example
     * col.find().filter({ x: 4 });
     */
    filter(expr: any): this;
    /**
     * Limit the number of documents that can be iterated.
     * @param {number} num The limit.
     * @return {Cursor}
     *
     * @example
     * col.find().limit(10);
     */
    limit(num: any): this;
    /**
     * Skip over a specified number of documents.
     * @param {number} num The number of documents to skip.
     * @return {Cursor}
     *
     * @example
     * col.find().skip(4);
     */
    skip(num: any): this;
    /**
     * Add new fields, and include or exclude pre-existing fields.
     * @param {object} spec Specification for projection.
     * @return {Cursor}
     *
     * @example
     * col.find().project({ _id: 0, x: 1, n: { $add: ['$k', 4] } });
     */
    project(spec: any): this;
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
    group(spec: any): this;
    /**
     * Deconstruct an iterable and output a document for each element.
     * @param {string} path A path to an iterable to unwind.
     * @return {Cursor}
     *
     * @example
     * col.find().unwind('$elements');
     */
    unwind(path: any): this;
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
    sort(spec: any): this;
    _init(cb: any): void;
}
export default Cursor;
