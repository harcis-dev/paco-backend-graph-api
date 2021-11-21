
const logger = require('../../utils/log/log.js');

/**
 * Get all availibe ids from all graphs in database,
 * contains:
 * - graph name
 * - variantscount
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

/**
 * 
 * @param {*} result 
 * @returns 
 */
function getIdsAndVariants(result){
    let idVariantsCount = [];
    for(let x of result){
        let id = x["_id"];
        let name = x["name"];
        if(x["dfg"]["graph"][0]["data"].hasOwnProperty("variants")){
            let variants = x["dfg"]["graph"][0]["data"]["variants"];
            let variantsCount = Object.keys(variants).length;
            idVariantsCount.push({"_id": id, "name": name, "variantsCount": variantsCount});
        }else{
            idVariantsCount.push({"_id": id, "name": name});
        }
        
        
        
    }
    return idVariantsCount;
}

module.exports = getGraphIds;