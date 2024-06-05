/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 数据库被阻止事件。
 * @event Db#blocked
 * @example
 * db.on('blocked', () => {
 *     console.log('数据库版本无法升级');
 * });
 */
/**
 * 代表数据库的类。
 * @param {string} name 数据库的名称。
 * @param {number} [version] 数据库的版本。
 * @param {object|string[]} config 集合配置。
 *
 * @example
 * let db = new webdb.Db('mydb', {
 *     // 定义集合。
 *     col1: {
 *         // 如果索引尚不存在，则创建索引。
 *         index1: true,
 *         // 从预先存在的数据库中删除索引。
 *         index2: false
 *     },
 *      // 使用索引定义集合。
 *     col2: ['index1', 'index2'],
 *     // 定义没有索引的集合。
 *     col3: true,
 *     // 从预先存在的数据库中删除集合。
 *     col4: false
 * });
 *
 * @example
 * // 定义没有索引的集合。
 * let db = new webdb.Db('mydb', ['col1', 'col2']);
 */
export declare class Db extends EventEmitter {
    private _cols;
    private _config;
    private _name;
    private _version;
    private _idb;
    private _open;
    constructor(name: any, version: any, config: {
        [x: string]: any;
    });
    /**
     * 数据库的名称。
     * @type {string}
     */
    get name(): any;
    /**
     * 数据库的版本。
     * @type {number}
     */
    get version(): any;
    _addCollection(name: string): void;
    _addIndex(index_config: {
        [x: string]: any;
    }, path: string): {} | undefined;
    _addStore(idb: {
        createObjectStore: (arg0: any, arg1: {
            keyPath: string;
            autoIncrement: boolean;
        }) => any;
    }, name: string): void;
    _getConn(): Promise<unknown>;
    /**
     * 检索一个 Collection 实例。
     * @param {string} name 集合的名称
     * @returns Promise<unknown>
     */
    collection(name: string): Promise<unknown>;
    /**
     * 打开与数据库的连接。
     * @returns Promise<unknown>
     */
    open(): Promise<unknown>;
    /**
     * 如果连接打开，则将其关闭。
     * @returns Promise<boolean>
     */
    close(): Promise<boolean>;
    /**
     * 删除数据库，关闭连接（如果打开）。
     * @returns Promise<unknown>
     */
    drop(): Promise<unknown>;
}
declare const _default: {
    Db: typeof Db;
};
export default _default;
