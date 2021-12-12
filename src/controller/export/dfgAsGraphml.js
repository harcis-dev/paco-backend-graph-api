const filterVariants = require("../../utils/filter/filterGraph.js")
const convertJson2Graphml = require("../../utils/convert/dfg/jsonToGraphml.js")
const logger = require('../../utils/log/log.js');

/**
 * Looking for the given @param {String} _id in database and converts to
 * a xml-based graphml file.
 * @see convertDFG2Graphml
 * @param {*} request 
 * @param {*} response 
 */

function exportDfgAsGraphml(request, response) {
    if (!request["params"].hasOwnProperty('_id')) {
        return response.status(400).send("Error: Requestbody must contain _id");
    }
    let query = {
        "_id": `${request["params"]["_id"]}`
    }
    collection.findOne(query, (error, result) => {
        if (typeof result == 'undefined' || result == null || result["matchedCount"] == 0) {
            return response.status(400).send("Error: No graph in database with provided _id");
        }
        let variants = [];
        let sequence = "";
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
            result = filterVariants(result, variants, "")
            let dfg = result["dfg"]["graph"]
            response.send(convertJson2Graphml(_id, dfg));
        } catch (error) {
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }

    });
}

module.exports = exportDfgAsGraphml;