import { getIDBError } from './util'

export const remove = (cur: any, cb: (arg0: Error) => any) => {
  (function iterate() {
    cur._next((error: any, doc: any, idb_cur: any) => {
      if (!doc) { return cb(error); }
      const idb_req = idb_cur.delete();
      idb_req.onsuccess = iterate;
      idb_req.onerror = (e: any) => cb(getIDBError(e));
    });
  })();
};

export default remove
