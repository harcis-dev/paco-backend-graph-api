
const logger = require('../../utils/log/log.js');

/**
 * Get all availibe ids from all graphs in database
 */
function getGraphIds(request, response){
    collection.find().toArray(function(error, result) {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`find: ${result}`);

        response.send(getIdsAndVariants(result));
    });
}

function getIdsAndVariants(result){
    let idVariantsCount = [];
    for(let x of result){
        let id = x["_id"];
        let variants = x["dfg"]["graph"][0]["data"]["variants"];
        let variantsCount = Object.keys(variants).length;
        idVariantsCount.push({"_id": id, "variantsCount": variantsCount});
    }
    return idVariantsCount;
}

module.exports = getGraphIds;