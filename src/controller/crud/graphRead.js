const filterVariants = require("../../utils/filter/filterGraph.js")

const logger = require('../../utils/log/log.js'); 

/**
 * Request for an graph with the given ID in MongoDB
 * Filter with the parameter in body:
 * - variants
 * - sequence
 */
function getGraph(request, response){
    let query = {"_id": `${request.query.id}`}
    collection.findOne(query,(error, result) => {
        let variants = [];
        let sequence = "";
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        /** @param {Array} variants - Filter with variants */
        if("variants" in request.body){
            variants = request.body.variants;
        }
        /** @param {String} sequence - Filter with sequence */
        if("sequence" in request.body){
            sequence = request.body.sequence;
        }
        logger.debug(`findOne: ${result}`);    
        try{
            response.send(filterVariants(result, variants, sequence));
        }catch(error){
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }
        
    });
}

module.exports = getGraph;