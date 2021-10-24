function isEmptyObject(obj) {
  let t = !(Object.keys(obj).length === 0);
  return t;
  }

module.exports = isEmptyObject;