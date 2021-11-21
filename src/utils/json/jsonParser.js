/**
 * Get value of a key in a json-String
 * @param {String} stringValue 
 * @param {String} key 
 * @returns {*} Value of the key
 */
function jsonParser(stringValue, key) {
    let string = JSON.stringify(stringValue);
    let objectValue = JSON.parse(string);
    return objectValue[key];
}

module.exports = jsonParser;