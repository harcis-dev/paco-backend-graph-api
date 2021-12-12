/**
 * @file Controller for reading graph ids with name and variantcounts 
 * @author HARCIS-DEV TEAM
 */

const logger = require('../../utils/log/log.js');

/**
 * Get all availibe ids from all graphs in database,
 * contains:
 * - graph name
 * - variantscount
 */
function getGraphIds(request, response) {
    collection.find().toArray(function(error, result) {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`find: ${result}`);

        response.send(getIdsNamesAndVariantCounts(result));
    });
}

/**
 * Selecting id, name and variantscount of a grapg
 * @param {object} result - All objects from database
 * @returns {object}
 */
function getIdsNamesAndVariantCounts(result) {
    let idVariantsCount = [];
    for (let graphs of result) {
        let id = graphs["_id"];
        let name = graphs["name"];
        let graph = 0;
        let variantsCount = 0;

        if (graphs.hasOwnProperty("dfg")) {
            graph = graphs["dfg"];
        } else if (graphs.hasOwnProperty("epc")) {
            graph = graphs["epc"];
        } else if (graphs.hasOwnProperty("bpmn")) {
            graph = graphs["bpmn"];
        }

        if (graph != 0) {
            if (graph["graph"][0]["data"].hasOwnProperty("variants")) {
                let variants = graph["graph"][0]["data"]["variants"];
                variantsCount = Object.keys(variants).length;
            }
            idVariantsCount.push({
                "_id": id,
                "name": name,
                "variantsCount": variantsCount
            });
        } else {
            idVariantsCount.push({
                "_id": "-1",
                "name": "Graph does not exist",
                "variantsCount": -1
            });
        }

    }
    return idVariantsCount;
}

module.exports = getGraphIds;