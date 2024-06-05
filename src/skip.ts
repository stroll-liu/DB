export const skip = (_next: any, num: any) => {
  let count = 0;
  const next = (cb: any) => {
    _next((error: any, doc: any) => {
      if (!doc) { cb(error); }
      else if (++count > num) { cb(null, doc); }
      else { next(cb); }
    });
  };
  return next;
};

export default skip
