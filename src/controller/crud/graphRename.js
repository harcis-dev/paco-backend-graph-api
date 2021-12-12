const jsonUtils = require("../../utils/jsonUtils.js")
const logger = require('../../utils/log/log.js');

/**
 * Rename a graph with id: @param {String} _id and given name @param {String} name
 */
function renameGraph(request, response) {
    let query = {
        "_id": `${request["params"]["_id"]}`
    }
    if (!request["body"].hasOwnProperty("name")) {
        return response.status(400).send("Error: Provide name as key value pair");
    }
    collection.updateOne(query, {
        "$set": {
            "name": `${jsonUtils.getKeyFromJsonString(request["body"], "name")}`
        }
    }, (error, result) => {
        if (typeof result == 'undefined' || result == null || result["matchedCount"] == 0) {
            return response.status(400).send("Error: No graph in database with provided _id");
        }
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`renameGraph: ${result}`);
        response.send(result);
    });
}

module.exports = renameGraph;