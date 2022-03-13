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

/**
 * Sort a map by value
 * @param {Map} map map to sort
 * @returns {Map} sorted map
 */
function sortMapByValue(map) {
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) {
        return b[1] - a[1]
    });
    var sortedMap = {};
    tupleArray.forEach(function (el) {
        sortedMap[el[0]] = el[1]
    });
    return sortedMap;
}

module.exports = {
    isEmptyObject: isEmptyObject,
    getKeyFromJsonString: getKeyFromJsonString,
    sortMapByValue: sortMapByValue
};