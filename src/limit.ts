export const limit = (_next, num) => {
  let count = 0;
  const next = (cb) => {
    if (count++ < num) { _next(cb); }
    else { cb(); }
  };
  return next;
};

export default limit
