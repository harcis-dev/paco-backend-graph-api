const logger = require('../../utils/log/log.js');

/**
 * Delete a graph with @param {String} _id
 */
function deleteGraph(request, response) {
    let query = {
        "_id": `${request["params"]["_id"]}`
    }
    collection.deleteOne(query, (error, result) => {
        if (typeof result == 'undefined' || result == null || result["deletedCount"] == 0) {
            return response.status(400).send("Error: No graph in database with provided _id");
        }
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`deleteOne: ${result}`);
        try {
            response.send(result);
        } catch (error) {
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }
    });
}

module.exports = deleteGraph;