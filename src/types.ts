import DB from '../index';
import DBTable from './table';

type PrimitiveType = number | string | boolean | null;
type DBDataType = PrimitiveType | object;

export type DBClass = DB;
export type DBTableClass = DBTable;

export interface DBData {
  id: number,
  [key: string]: DBDataType | Array<DBDataType>
}

export interface DBInputData {
  [key: string]: DBDataType | Array<DBDataType>
}

export interface DBTableSearch {
  [key: string]: number | string
}

export type GetDBCallback = (idb: IDBDatabase) => void;

export type TableFindFunction = (item?: DBData) => boolean;

export interface TableIndex {
  multiEntry?: boolean
  unique?: boolean
  default?: any
  ref?: string
}

export interface DBConfig {
  version?: number
}

export interface DBTableSchema {
  [key: string]: TableIndex
}

export interface DBSchema {
  [table: string]: DBTableSchema
}

export interface DBTableDict {
  [table: string]: DBTableClass
}
