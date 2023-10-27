import { toPathPieces } from '../util'

export class Path {
  pieces: any;
  literal: any;
  constructor(path) {
    this.pieces = toPathPieces(path);
    this.literal = path;
  }
}

export default Path;
