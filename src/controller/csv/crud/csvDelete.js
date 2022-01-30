/**
 * @file Controller for deleting csv
 * @author HARCIS-DEV TEAM
 */

const fs = require('fs');

const mongoose = require('mongoose');

// Database
const mongodb = require('../../../database/mongodb.js')

const logger = require('../../../utils/log/log.js');

/**
 * Delete a csv with @param {String} _id
 */
function csvDelete(request, response) {
    let query = {
        "_id": mongoose.Types.ObjectId(request["params"]["_id"])
    }
    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbCsvCollection).findOne(query, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`findOne in delete: ${result}`);
        try {
            database.collection(mongodb.mongodbCsvCollection).deleteOne(query, (error_del, result_del) => {
                if (typeof result_del == 'undefined' || result_del == null || result_del["deletedCount"] == 0) {
                    return response.status(400).send("Error: No graph in database with provided _id");
                }
                if (error_del) {
                    logger.error(`${error_del}`);
                    return response.status(500).send(error_del);
                }
                logger.debug(`deleteOne: ${result_del}`);
                try {
                    fs.unlinkSync(result.path);
                    response.send(result_del);
                } catch (error) {
                    logger.error(`${error}`);
                    return response.status(500).send(`${error}`);
                }
            });
        } catch (error) {
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }
    });

}

module.exports = csvDelete;