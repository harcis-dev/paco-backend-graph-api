const logger = require('../../utils/log/log.js');

/**
 * Delete a graph with @param {String} _id
 */
function deleteGraph(request, response) {
    let query = {"_id": `${request.params.graphId}`}
    collection.deleteOne(query, (error, result) => {
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