
const logger = require('../../utils/log/log.js');
const convertGraphml2DFG = require("../../utils/convert/graphmlToDfg.js")

function importGraphmlAsDfg(request, response){

    graphId = request.body._id;
    dfgJson = convertGraphml2DFG(request.body);
    collection.replaceOne({"_id": `${graphId}`}, {"_id": `${graphId}`, "dfg": dfgJson},{upsert: true}, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}

module.exports = importGraphmlAsDfg;