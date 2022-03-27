/**
 * @file Utilities for JSON Objects
 * @author HARCIS-DEV TEAM
 */

/**
 * Check if an Object got no keys == is empty
 * @param {Object} obj 
 * @returns {Boolean}
 */
function isEmptyObject(obj) {
    return (Object.keys(obj).length === 0);
}

/**
 * Get value of a key in a json-String
 * @param {String} stringValue 
 * @param {String} key 
 * @returns {*} Value of the key
 */
function getKeyFromJsonString(stringValue, key) {
    let string = JSON.stringify(stringValue);
    let objectValue = JSON.parse(string);
    return objectValue[key];
}

module.exports = {
    isEmptyObject: isEmptyObject,
    getKeyFromJsonString: getKeyFromJsonString,
};