function jsonParser(stringValue, key) {
    let string = JSON.stringify(stringValue);
    let objectValue = JSON.parse(string);
    return objectValue[key];
}

module.exports = jsonParser;