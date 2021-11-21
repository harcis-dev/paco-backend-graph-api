const jsonParser = require("../../utils/json/jsonParser.js")
const logger = require('../../utils/log/log.js'); 

/**
 * rename a graph with id: @param {String} _id and given name @param {String} name
 */
function renameGraph(request, response){
    let query = {"_id": `${request.params.graphId}`}
    collection.updateOne(query, { "$set" : { "name" : `${jsonParser(request.body, "name")}` } }, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`renameGraph: ${result}`);
        response.send(result);
    });
}

module.exports = renameGraph;