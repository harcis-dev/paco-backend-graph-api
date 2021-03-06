/**
 * @file Controller for reading graph
 * @author HARCIS-DEV TEAM
 */

// Database
const mongodb = require("../../../database/mongodb.js");

const filterGraph = require("../../../utils/filter/filterGraph.js");

const logger = require("../../../utils/log/log.js");

const globalParameter = require("../../../global/globals.js");

/**
 * Request for an graph with the given ID in MongoDB
 * Filter with the parameter in body:
 * - variants
 * - sequence
 */
function getGraph(request, response) {
  let query = {
    _id: `${request["params"]["_id"]}`,
  };
  let graphTypesRequest;
  let nodes = -1;
  if ("graphTypes" in request["body"]) {
    graphTypesRequest = request["body"]["graphTypes"];
  }
  if ("nodes" in request["body"]) {
    nodes = request["body"]["nodes"];
  }
  let database = mongodb.getDatabase();
  database
    .collection(mongodb.mongodbGraphCollection)
    .findOne(query, (error, result) => {
      if (typeof result == "undefined" || result == null) {
        return response
          .status(400)
          .send("Error: No graph in database with provided _id");
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
      /** @param {String} sequence - Filter with sequence */
      if ("sequence" in request["body"]) {
        sequence = request["body"]["sequence"];
      }
      logger.debug(`findOne: ${result}`);
      try {
        response.send(
          filterGraph(result, variants, sequence, graphTypesRequest, nodes)
        );
      } catch (error) {
        logger.error(`${error}`);
        logger.error(`${error.stack}`);
        return response.status(400).send(`${error.stack}`);
      }
    });
}

module.exports = getGraph;
