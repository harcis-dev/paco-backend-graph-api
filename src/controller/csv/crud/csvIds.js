/**
 * @file //TODO
 * @author HARCIS-DEV TEAM
 */

// Database
const mongodb = require('../../../database/mongodb.js')

const logger = require('../../../utils/log/log.js');

/**
 * // TODO
 */
function getCSVIds(request, response) {
    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbCsvCollection).find().toArray(function (error, result) {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`find: ${result}`);

        response.send(result);
    });
}

module.exports = getCSVIds;