/**
 * @file Controller for reading graph ids with name and variantcounts
 * @author HARCIS-DEV TEAM
 */

// Database
const mongodb = require("../../../database/mongodb.js");

const logger = require("../../../utils/log/log.js");

const getIdsNamesAndVariantCounts = require("../../../utils/filter/getIdsNamesAndVariantsCounts.js");

/**
 * Get all availibe ids from all graphs in database,
 * contains:
 * - _id
 * - graph name
 * - variantscount
 * - graphTypes
 */
function getGraphIds(request, response) {
  let database = mongodb.getDatabase();
  database
    .collection(mongodb.mongodbGraphCollection)
    .find()
    .toArray(function (error, result) {
      if (error) {
        logger.error(`${error}`);
        return response.status(500).send(error);
      }
      logger.debug(`find: ${result}`);

      response.send(getIdsNamesAndVariantCounts(result));
    });
}

module.exports = getGraphIds;
