
/**
 * @file Utilities for data structres
 * @author HARCIS-DEV TEAM
 */

/**
 * @param {Map} map 
 * @returns {Array} tuple array
 */
 function generateTupleArrayFromMap(map){
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) {
        return b[1] - a[1]
    });
    return tupleArray;
}

/**
 * @param {Array} tupleArray 
 * @returns {Map} sorted map
 */
function generateMapFromTupleArray(tupleArray){
    var sortedMap = {};
    tupleArray.forEach(function (el) {
        sortedMap[el[0]] = el[1]
    });
    return sortedMap;
}


module.exports = {
    generateTupleArrayFromMap: generateTupleArrayFromMap,
    generateMapFromTupleArray: generateMapFromTupleArray
};