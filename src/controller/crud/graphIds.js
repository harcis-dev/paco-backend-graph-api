
const logger = require('../../utils/log/log.js'); 

/**
 * Get all availibe ids from all graphs in database
 */
function getGraphIds(request, response){
    collection.distinct( '_id',(error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`find: ${result}`);
        response.send(result);
    });
}

module.exports = getGraphIds;