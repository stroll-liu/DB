import Cursor from './cursor';
export declare const ops: any;
/**
 *
 * @param doc 文档
 * @returns {[Function, any]} [Function, any]
 */
export declare const getStageObject: (doc: any) => [Function, any];
/**
 *
 * @param {this} col this
 * @param {object[]} pipeline 管道。
 * @returns {Promise} Promise<Cursor>
 */
export declare const aggregate: (col: any, pipeline: any) => Promise<Cursor>;
export default aggregate;
