export const limit = (_next: any, num: any) => {
  let count = 0;
  const next = (cb: any) => {
    if (count++ < num) { _next(cb); }
    else { cb(); }
  };
  return next;
};

export default limit
