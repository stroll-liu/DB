export declare class Fields {
    _doc: any;
    constructor(doc: any);
    get(path: {
        pieces: string | any[];
    }): symbol;
    ensure(paths: any): boolean;
}
export default Fields;
