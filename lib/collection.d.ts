import Cursor from './cursor';
/** 代表集合的类。 */
export declare class Collection {
    private _db;
    private _name;
    private _indexes;
    /** <strong>注意:</strong> 不要直接实例化. */
    constructor(db: any, name: string);
    /**
     * 集合的名称。
     * @type {string}
     */
    get name(): string;
    _isIndexed(path: unknown): boolean;
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
    find(expr: any, projection_spec: any): Promise<Cursor>;
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
    findOne(expr: any, projection_spec: any): Promise<unknown | Error>;
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
    aggregate(pipeline: any): Promise<Cursor>;
    _validate(doc: {
        [x: string]: any;
    }): void;
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
    insert(docs: string | any[]): Promise<unknown>;
    _modify(fn: any, expr: any): Promise<unknown>;
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
    update(expr: any, spec: any): Promise<unknown>;
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
    remove(expr: any): Promise<unknown>;
}
export default Collection;
