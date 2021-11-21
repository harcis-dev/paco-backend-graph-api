/**
 * Check if an Object got no keys == is empty
 * @param {Object} obj 
 * @returns {Boolean}
 */
function isEmptyObject(obj) {
  return (Object.keys(obj).length === 0);
  }

module.exports = isEmptyObject;