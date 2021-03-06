/**
 * @file Controller for creating or updating graph
 * @author HARCIS-DEV TEAM
 */

const jsonUtils = require("../../../utils/jsonUtils.js");
const logger = require('../../../utils/log/log.js');

// Database
const mongodb = require('../../../database/mongodb.js')

/**
 * Insert graph with @param {String} _id if not exist, Replace graph if @param {String} _id exist
 * return Response with accpeted or failed answer
 */
function upsertGraph(request, response) {
    if (!request["body"].hasOwnProperty('_id')) {
        return response.status(400).send("Error: Requestbody must contain _id");
    }
    _id = jsonUtils.getKeyFromJsonString(request["body"], "_id")
    if (!request["body"].hasOwnProperty('name')) {
        request["body"]['name'] = _id
    }
    delete request["body"]["_id"]
    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbGraphCollection).replaceOne({
        "_id": `${_id}`
    }, request["body"], {
        upsert: true
    }, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}

module.exports = upsertGraph;