/**
 * @file Export epc json
 * @author HARCIS-DEV TEAM
 */

const filterVariants = require("../../../utils/filter/filterGraph.js")
const convertJsonToEpml = require("../../../utils/convert/epc/jsonToEpml.js")
const logger = require('../../../utils/log/log.js');

// Database
const mongodb = require('../../../database/mongodb.js')

/**
 * Looking for the given @param {String} _id in database and converts to
 * a xml-based graphml file.
 * @see convertDFG2Graphml
 * @param {*} request 
 * @param {*} response 
 */

function exportEpcAsEpml(request, response) {
    if (!request["params"].hasOwnProperty('_id')) {
        return response.status(400).send("Error: Requestbody must contain _id");
    }
    let query = {
        "_id": `${request["params"]["_id"]}`
    }
    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbGraphCollection).findOne(query, (error, result) => {
        if (typeof result == 'undefined' || result == null || result["matchedCount"] == 0) {
            return response.status(400).send("Error: No graph in database with provided _id");
        }
        let variants = [];
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        /** @param {Array} variants - Filter with variants */
        if ("variants" in request["body"]) {
            variants = request["body"]["variants"];
        }
        logger.debug(`findOne: ${result}`);
        try {
            let _id = result["_id"]
            let name = result["name"]
            result = filterVariants(result, variants, "")
            let epc = result["epc"]["graph"]
            response.send(convertJsonToEpml(_id, name, epc));
        } catch (error) {
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }

    });
}

module.exports = exportEpcAsEpml;