import { unknownOp } from './util'
import Cursor from './cursor'

export const ops: any = {
  $match: (cur: any, doc: any) => cur.filter(doc),
  $project: (cur: any, spec: any) => cur.project(spec),
  $group: (cur: any, spec: any) => cur.group(spec),
  $unwind: (cur: any, path: any) => cur.unwind(path),
  $sort: (cur: any, spec: any) => cur.sort(spec),
  $skip: (cur: any, num: any) => cur.skip(num),
  $limit: (cur: any, num: any) => cur.limit(num)
};

/**
 * 
 * @param doc 文档
 * @returns {[Function, any]} [Function, any]
 */
export const getStageObject = (doc: any): [Function, any] => {
  const op_keys = Object.keys(doc);
  if (op_keys.length > 1) {
    throw Error('阶段必须仅由一名操作员通过');
  }
  const op_key = op_keys[0], fn = ops[op_key];
  if (!fn) { unknownOp(op_key); }
  return [fn, doc[op_key]];
};
/**
 * 
 * @param {this} col this
 * @param {object[]} pipeline 管道。
 * @returns {Promise} Promise<Cursor>
 */
export const aggregate = (col: any, pipeline: any): Promise<Cursor> => {
  return new Promise((resolve, reject) => {
    try {
      const cur = new Cursor(col, 'readonly');
      for (let doc of pipeline) {
        const [fn, arg] = getStageObject(doc);
        fn(cur, arg);
      }
      resolve(cur);
    } catch (error) {
      reject(error)
    }
  })
};

export default aggregate;
