import DBTable from './src/table';
import { indexedDB } from './src/window';
import {
  DBConfig,
  DBTableSchema,
  DBTableDict,
  GetDBCallback,
  DBSchema
} from './src/types';

export default class DB {
  name: string;
  version: number;
  idb: IDBDatabase | null;
  tables: DBTableDict;

  private _closed: boolean;
  private _connection: IDBOpenDBRequest | null;
  private _callbackQueue: Array<Function>;

  onOpened: Function;
  onClosed: Function | null;

  constructor(name: string, schema?: DBSchema, config?: DBConfig) {

    this.version = 0;
    this.tables = {};
    this._callbackQueue = [];

    this.name = name;

    if (config) {
      const { version } = config;
      if (version) this.version = version;
    }

    this.updateSchema(schema);

    this.getDB();
  }

  table(table: string, tableSchema?: DBTableSchema): DBTable {
    if (!this.tables[table]) {
      this.tables[table] = new DBTable(this, table, tableSchema);
      this.updateSchema();
    } else if (tableSchema)  {
      this.tables[table] = new DBTable(this, table, tableSchema);
      if (this._shouldUpgrade()) this.updateSchema();
    }
    return this.tables[table];
  }

  updateSchema(schema?: DBSchema): void {
    if (schema) {
      this.tables = {};
      for (let table in schema)
        this.tables[table] = new DBTable(this, table, schema[table]);
    }
    if (this.idb) {
      this.idb.close();
      this.idb = null;
      this._openDB(++this.version, true);
    }
  }

  close(): void {
    if (this.idb) {
      this.idb.close();
      this.idb = null;
      this._connection = null;
      this._closed = true;
    } else {
      console.warn(`无法关闭数据库['${this.name}']: 它还没有打开`);
    }
  }

  delete(database?: string): Promise<Event> {
    return new Promise((resolve, reject) => {

      database = database || this.name;

      this.close();

      const deleteRequest = indexedDB.deleteDatabase(database);

      deleteRequest.onsuccess = (ev) => {

        this.version = 0;
        if (this.onClosed) {
          if (typeof this.onClosed === 'function')
            this.onClosed();
          else
            console.warn(`'onClosed' 应该是一个函数，而不是 ${typeof this.onClosed}`);

          this.onClosed = null;
        }
        resolve(ev);
      };

      deleteRequest.onerror = (ev) => {
        const { error } = ev.target as IDBOpenDBRequest;
        const { name, message }: any = error;
        console.warn(
          `无法删除数据库['${database}']\
          \n- ${name}: ${message}`
        );
        reject(`${name}: ${message}`);
      };
    });
  }

  getDBState(): string {
    if (this._closed)
      return 'closed';
    if (this.idb)
      return 'opened';
    if (this._connection)
      return 'connecting';
    return 'init';
  }

  getDB(callback?: GetDBCallback): void {

    if (this.idb) {
      if (callback && typeof callback === 'function')
        callback(this.idb);
      return;
    }

    if (this._closed) {
      console.warn(`数据库['${this.name}'] 已关闭，操作将不会执行`);
      return;
    }

    if (this._connection) {
      if (callback && typeof callback === 'function')
        this._callbackQueue.push(callback);
      return;
    }

    if (this.version)
      this._openDB(this.version);
    else
      this._openDB();
  }

  private _openDB(version?: number, stopUpgrade?: boolean): void {

    const database = this.name;
    const tables = this.tables;

    this._connection = version
      ? indexedDB.open(database, version)
      : indexedDB.open(database);

    this._connection.onsuccess = (ev) => {

      const result = this._connection.result
        || (ev.target as IDBOpenDBRequest).result;

      this.version = result.version;

      if (!this.idb) {
        this.idb = result;
      }
      if (Array.isArray(this.idb.objectStoreNames)) {
        this.idb.objectStoreNames.forEach((name: string) => {
          if (!this.tables[name])
            this.tables[name] = new DBTable(this, name);
        });
      }

      if (this._shouldUpgrade() && !stopUpgrade) {
        this.updateSchema();

      } else {

        if (this._callbackQueue.length) {
          this._callbackQueue.forEach(fn => fn(this.idb));
          this._callbackQueue = [];
        }

        if (this.onOpened) {

          if (typeof this.onOpened === 'function')
            this.onOpened(this.idb);
          else
            console.warn(`'onOpened' 应该是一个函数，而不是 ${typeof this.onOpened}`);

          this.onOpened = null;
        }
      }
    };

    this._connection.onupgradeneeded = (ev) => {
      const { oldVersion, newVersion, target } = ev;
      const { transaction } = target as IDBOpenDBRequest;

      this.idb = (target as IDBOpenDBRequest).result;
      this.version = newVersion;

      if (oldVersion === 0)
        console.log(`创造数据库['${database}'] 版本为 (${newVersion})`);

      for (let table in tables)
        this._updateObjectStore(table, tables[table].schema, transaction);

      if (oldVersion !== 0)
        console.log(`数据库['${database}'] 版本从 (${oldVersion}) 升到了 (${newVersion})`);

    };

    this._connection.onerror = (ev) => {
      const { error } = ev.target as IDBOpenDBRequest;
      const { name, message } = error;
      throw Error(
        `打开数据库失败['${database}']`
        + `\n- ${name}: ${message}`
      );
    };

    this._connection.onblocked = (ev) => {
      const { newVersion, oldVersion } = ev as IDBVersionChangeEvent;
      console.warn(
        `数据库['${database}'] 正在打开版本 (${oldVersion}),`,
        `因此对 (${newVersion}) 版本的开放请求被阻止.`
      );
    };
  }

  private _shouldUpgrade(): boolean {
    const idb = this.idb;
    if (!idb) return false;
    const tables = this.tables;
    for (let table in tables) {
      if (idb.objectStoreNames.contains(table)) {

        const transaction = idb.transaction(table, 'readonly');
        const { indexNames, keyPath, autoIncrement } = transaction.objectStore(table);

        if (keyPath !== '_id' || !autoIncrement) {
          this.close();
          throw Error(
            `IndexedDB '${this.name}' 中当前存在的 objectStore '${table}' `
            + ` 有一个 ${autoIncrement ? '' : 'non-'}autoIncrement keyPath \`${keyPath}\`,`
            + ` 而 DB 需要一个 autoIncrement keyPath \`_id\`,`
            + ` 因此 DB 无法打开数据库['${this.name}']`
          );
        }

        for (let index in tables[table].schema) {
          if (indexNames.contains(index)) {
          } else {
            transaction.abort();
            return true;
          }
        }
        transaction.abort();

      } else {
        return true;
      }
    }
    return false;
  }

  private _updateObjectStore(table: string, schema: DBTableSchema, transaction: IDBTransaction): void {

    const idb = this.idb;
    if (!idb) return;

    const putIndex = (index: string, store: IDBObjectStore, update?: boolean) => {

      if (index === 'id') return;
      if (update) store.deleteIndex(index);

      store.createIndex(index, index, {
        unique: !!schema[index]['unique'],
        multiEntry: !!schema[index]['multiEntry']
      });
    }

    if (idb.objectStoreNames.contains(table)) {
      const store = transaction.objectStore(table);
      const { indexNames } = store;

      for (let index in this.tables[table].schema)
        putIndex(index, store, indexNames.contains(index));
    } else {
      const store = idb.createObjectStore(table, {
        keyPath: '_id',
        autoIncrement: true
      });
      for (let index in schema)
        putIndex(index, store);
    }
  }
}
