import {
  DBClass,
  DBData,
  DBInputData,
  DBTableSchema,
  DBTableSearch,
  TableFindFunction
} from './types';

export default class DBTable {
  name: string;
  db: DBClass;
  schema: DBTableSchema;

  constructor(db: DBClass, name: string, schema?: DBTableSchema) {

    this.db = db;
    this.name = name;

    this.schema = schema || {};

  }

  get(criteria: DBTableSearch | number): Promise<DBData> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          const store = idb
            .transaction(this.name, 'readonly')
            .objectStore(this.name);

          const onSuccess = (e: Event) => {
            const { result } = e.target as IDBRequest;
            resolve(result);
          }

          const onError = (e: Event) => {
            const { error } = e.target as IDBRequest;
            reject(error);
          }

          if (typeof criteria === 'object') {
            const key = Object.keys(criteria)[0];
            const value = criteria[key];

            const request = key === '_id'
              ? store.get(value)
              : store.index(key).get(value);

            request.onsuccess = onSuccess;
            request.onerror = onError;
          } else if (typeof criteria === 'number') {
            const request = store.get(criteria);

            request.onsuccess = onSuccess;
            request.onerror = onError;
          } else {
            reject(new Error('Table.get() failed: invalid criteria'));
          }

        } catch (err) {
          reject(err);
        }
      });
    });
  }

  gets(limit?: number): Promise<DBData[]> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          const store = idb
            .transaction(this.name, 'readonly')
            .objectStore(this.name);

          const request = limit
            ? store.getAll(null, limit)
            : store.getAll();

          request.onsuccess = (e) => {
            const { result } = e.target as IDBRequest;
            resolve(result);
          };

          request.onerror = (e) => {
            const { error } = e.target as IDBRequest;
            reject(error);
          };

        } catch (err) {
          reject(err);
        }
      });
    });
  }

  add(data: DBInputData): Promise<DBData> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          const store = idb
            .transaction(this.name, 'readwrite')
            .objectStore(this.name);

          const request = store.add(data);

          request.onsuccess = (e) => {
            const { result } = e.target as IDBRequest;
            resolve({
              ...data,
              id: result
            });
          };

          request.onerror = (e) => {
            const { error } = e.target as IDBRequest;
            reject(error);
          };

        } catch (err) {
          reject(err);
        }
      });
    });
  }

  adds(data: DBInputData[]): Promise<DBData[]> {
    return new Promise(async (resolve, reject) => {
      if (Array.isArray(data)) {
        const arr: any = [];
        for (let item of data) {
          arr.push(await this.add(item));
        }
        resolve(arr);
      } else {
        reject(new Error('Table.addMany() 失败：输入数据应该是一个数组'));
      }
    });
  }

  put(data: DBData): Promise<DBData> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        if (!(data && typeof data === 'object'))
          return reject(new Error('Table.put() 失败：数据应该是一个对象'));
        if (!data._id)
          return reject(new Error('Table.put() failed: 失败：数据中需要 _id'));
        try {
          const store = idb
            .transaction(this.name, 'readwrite')
            .objectStore(this.name);

          const request = store.put(data);

          request.onsuccess = (e) => {
            const { result } = e.target as IDBRequest;
            resolve({
              ...data,
              id: result
            });
          };

          request.onerror = (e) => {
            const { error } = e.target as IDBRequest;
            reject(error);
          };
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  update() {

  }

  delete(criteria: DBTableSearch | number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          this.get(criteria).then((doc: any) => {
            const store = idb
              .transaction(this.name, 'readwrite')
              .objectStore(this.name);

            const request = store.delete(doc._id);

            request.onsuccess = () => {
              resolve();
            };

            request.onerror = (e) => {
              const { error } = e.target as IDBRequest;
              reject(error);
            };
          });
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  find(fn: TableFindFunction): Promise<DBData | null> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          const store = idb
            .transaction(this.name, 'readonly')
            .objectStore(this.name);

          store.openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              if (fn(cursor.value))
                return resolve(cursor.value);
              cursor.continue();
            } else {
              resolve(null);
            }
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  findAll(fn: TableFindFunction): Promise<DBData[]> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          const store = idb
            .transaction(this.name, 'readonly')
            .objectStore(this.name);

          const data: any = [];

          store.openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              if (fn(cursor.value))
                data.push(cursor.value);
              cursor.continue();
            } else {
              resolve(data);
            }
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  where() {

  }

  console(limit: number = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.getDB((idb) => {
        try {
          if (limit > 1000) {
            console.warn(`控制台输出限制不超过 1000`);
            limit = 1000;
          }

          let count = 0;
          const data = {};

          const store = idb
            .transaction(this.name, 'readonly')
            .objectStore(this.name);

          store.openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor && count < limit) {
              count += 1;
              data[cursor.key] = { ...cursor.value };
              delete data[cursor.key]._id;
              cursor.continue();
            } else {
              console.table(data);
              resolve();
            }
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
