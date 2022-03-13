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

function generateTupleArrayFromMap(map){
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) {
        return b[1] - a[1]
    });
    return tupleArray;
}

function generateMapFromTupleArray(tupleArray){
    var sortedMap = {};
    tupleArray.forEach(function (el) {
        sortedMap[el[0]] = el[1]
    });
    return sortedMap;
}

module.exports = {
    isEmptyObject: isEmptyObject,
    getKeyFromJsonString: getKeyFromJsonString,
    generateTupleArrayFromMap: generateTupleArrayFromMap,
    generateMapFromTupleArray: generateMapFromTupleArray
};