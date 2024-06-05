import { toPathPieces, get } from './util'

export const unwind = (_next: any, path: any) => {
    const path_pieces = toPathPieces(path.substring(1)),
          elements: any = [],
          fn = (cb: any) => cb(null, elements.pop());

    const onDoc = (doc: any, cb: any) => {
        const old_length = elements.length;

        get(doc, path_pieces, (obj, field) => {
            const new_elements = obj[field];
            if (!new_elements) { return; }

            if (new_elements[Symbol.iterator]) {
                for (let element of new_elements) {
                    elements.push({ [field]: element });
                }
            }
        });

        if (old_length === elements.length) {
            return next(cb);
        }

        fn(cb);
    };

    let next = (cb: any) => {
        _next((error: any, doc: any) => {
            if (error) { cb(error); }
            else if (doc) { onDoc(doc, cb); }
            else { (next = fn)(cb); }
        });
    };

    return (cb: any) => next(cb);
};

export default unwind
