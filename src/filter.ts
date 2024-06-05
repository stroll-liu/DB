import Fields from './lang/fields'

export const filter = (next: any, pred: any) => (cb: any) => {
  (function iterate() {
    next((error: any, doc: any, idb_cur: any) => {
      if (!doc) { cb(error); }
      else if (pred.run(new Fields(doc))) {
        cb(null, doc, idb_cur);
      } else { iterate(); }
    });
  })();
};

export default filter
