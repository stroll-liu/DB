import memoize from 'memoizee';

import { get } from '../util'
import MISSING from './missing_symbol'

export class Fields {
  _doc: any;
  constructor(doc: any) {
    this._doc = doc;
    this.get = memoize(this.get);
  }

  get(path: { pieces: string | any[]; }) {
    let value = MISSING;
    get(this._doc, path.pieces, (obj, field) => {
      value = obj[field];
    });
    return value;
  }

  ensure(paths: any) {
    for (let path of paths) {
      if (this.get(path) === MISSING) {
        return false;
      }
    }
    return true;
  }
}

export default Fields;
