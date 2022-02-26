/**
 * @file Controller to export csv-files
 * @author HARCIS-DEV TEAM
 */
const jsonUtils = require("../../../utils/jsonUtils.js");
const logger = require('../../../utils/log/log.js');

// Database
const mongodb = require('../../../database/mongodb.js')
var fs = require('fs');
const { ObjectId } = require("mongodb");


/**
 * Download csv-file with provided @param {String} _id
 * 
 * Source:
 * https://medium.com/@svibhuti22/file-upload-with-multer-in-node-js-and-express-5bc76073419f
 */
function csvExport(request, response) {
    if (!request["params"].hasOwnProperty('_id')) {
        return response.status(400).send("Error: Requestbody must contain _id");
    }
    let query = {
        "_id": ObjectId(`${request["params"]["_id"]}`)
    }
    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbCsvCollection).findOne(query, (error, result) => {
        if (typeof result == 'undefined' || result == null || result["matchedCount"] == 0) {
            return response.status(400).send("Error: No graph in database with provided _id");
        }
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`csv - findOne: ${result}`);
        try {
            const file = result.path;
            response.download(file);

        } catch (error) {
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }

    });
}

module.exports = csvExport;