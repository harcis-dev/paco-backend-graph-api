const filterVariants = require("../../utils/filter/filterGraph.js")
const convertDFG2Graphml = require("../../utils/convert/dfgToGraphml.js")
const logger = require('../../utils/log/log.js'); 

function downloadDfgAsGraphml(request, response){
    let query = {"_id": `${request.params.graphId}`}
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
        logger.debug(`findOne: ${result}`);    
        try{
            let graphId = result["_id"]
            result = filterVariants(result, variants, "")
            let dfg = result["dfg"]["graph"]
            response.send(convertDFG2Graphml(graphId, dfg));
        }catch(error){
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }
        
    });
}

module.exports = downloadDfgAsGraphml;