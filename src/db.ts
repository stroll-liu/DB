import { EventEmitter } from 'events'

import { getIDBError } from './util'
import Collection from './collection'

const GT: any = globalThis

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
export class Db extends EventEmitter {
    private _cols: any
    private _config: any
    private _name: any
    private _version: any
    private _idb: any
    private _open: boolean | undefined
    constructor(name: any, version: any, config: { [x: string]: any }) {
        super();
        this._name = name;
        if (typeof version === 'object') { config = version; }
        else { this._version = version; }
        this._cols = {};
        this._config = {};
        if (Array.isArray(config)) {
            for (let name of config) {
                this._addCollection(name);
                this._config[name] = true;
            }
        } else {
            for (let name in config) {
                this._addCollection(name);
                this._addIndex(config[name], name);
            }
        }
    }
    /**
     * 数据库的名称。
     * @type {string}
     */
    get name(): any { return this.name; }
    /**
     * 数据库的版本。
     * @type {number}
     */
    get version(): any { return this.version; }

    _addCollection(name: string) {
        this._cols[name] = new Collection(this, name);
    }

    _addIndex(index_config: { [x: string]: any }, path: string) {
        const config = this._config;
        if (!index_config) { return config[path] = false; }
        if (typeof index_config !== 'object') {
            return config[path] = {};
        }
        const col = this._cols[path];
        if (Array.isArray(index_config)) {
            const new_value: any = {};
            for (let index_path of index_config) {
                new_value[index_path] = true;
                col._indexes.add(index_path);
            }
            config[path] = new_value;
        } else {
            for (let index_path in index_config) {
                if (index_config[index_path]) {
                    col._indexes.add(index_path);
                }
            }
            config[path] = index_config;
        }
    }

    _addStore(idb: { createObjectStore: (arg0: any, arg1: { keyPath: string; autoIncrement: boolean }) => any }, name: string) {
        const store = idb.createObjectStore(name, {
            keyPath: '_id',
            autoIncrement: true
        });
        const index_config = this._config[name];
        for (let path in index_config) {
            if (index_config[path]) {
                store.createIndex(path, path, { unique: false });
            } else { store.deleteIndex(path); }
        }
    }

    _getConn(): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let req;
            if (this._version) {
                req = GT.indexedDB.open(this._name, this._version);
            } else { req = GT.indexedDB.open(this._name); }

            req.onsuccess = (e: { target: { result: any } }) => {
                const idb = e.target.result;
                this._idb = idb;
                this._version = idb.version;
                this._open = true;
                resolve(idb);
            };
            req.onerror = (e: any) => reject(getIDBError(e));
            req.onupgradeneeded = (e: { target: { result: any } }) => {
                const idb = e.target.result;
                for (let name in this._config) {
                    try {
                        if (!this._config[name]) {
                            idb.deleteObjectStore(name);
                        } else if (!idb.objectStoreNames.contains(name)) {
                            this._addStore(idb, name);
                        }
                    } catch (error) { return reject(error); }
                }
            };
            req.onblocked = () => this.emit('blocked');
        })
    }

    /**
     * 检索一个 Collection 实例。
     * @param {string} name 集合的名称
     * @returns Promise<unknown>
     */
    collection(name: string): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const col = this._cols[name];
            if (!col) reject({code: 0, mag: `collection '${name}' 不存在`})
            else resolve(col)
        })
    }

    /**
     * 打开与数据库的连接。
     * @returns Promise<unknown>
     */
    open(): Promise<unknown> {
        return this._getConn();
    }

    /**
     * 如果连接打开，则将其关闭。
     * @returns Promise<boolean>
     */
    async close(): Promise<boolean> {
        try {
            if (this._open) {
                this._idb.close();
                this._open = false;
            }
            return Promise.resolve(true)
        } catch (error) {
            return Promise.reject(false)
        }
        
    }

    /**
     * 删除数据库，关闭连接（如果打开）。
     * @returns Promise<unknown>
     */
    async drop(): Promise<unknown> {
        await this.close();
        return new Promise((resolve, reject) => {
            const req = GT.indexedDB.deleteDatabase(this._name);
            req.onsuccess = () => resolve(true);
            req.onerror = (e: any) => reject(getIDBError(e));
        })
    }
}

export default {Db};
