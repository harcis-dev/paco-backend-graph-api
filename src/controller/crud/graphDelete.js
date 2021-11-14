const logger = require('../../utils/log/log.js');

/**
 * Request for an graph with the given ID in MongoDB
 * Filter with the parameter in body:
 * - variants
 * - sequence
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