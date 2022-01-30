/**
 * @file // TODO
 * @author HARCIS-DEV TEAM
 */

const jsonUtils = require("../../../utils/jsonUtils.js");
const logger = require('../../../utils/log/log.js');

// Database
const mongodb = require('../../../database/mongodb.js')
const fs = require('fs');

/**
 * // TODO
 * 
 * https://medium.com/@svibhuti22/file-upload-with-multer-in-node-js-and-express-5bc76073419f
 */
function csvImport(request, response) {

    var file_path = request.file.path;

    if (!(Object.prototype.hasOwnProperty.call(request, 'file'))) {
        fs.unlinkSync(file_path);
        return response.status(400).send("Error: Requestbody must contain file");
    }

    object = {
        "name": `${request["body"]['name']}`,
        "path": `${file_path}`
    }

    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbCsvCollection).insertOne(object, (error, result) => {
        if (error) {
            fs.unlinkSync(file_path);
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}

module.exports = csvImport;