
const jsonParser = require("../../utils/json/jsonParser.js");
const logger = require('../../utils/log/log.js'); 
const convertGraphml2DFG = require("../../utils/convert/graphmlToDfg.js")

function importGraphmlAsDfg(request, response){
    let _id = jsonParser(request.body, "_id")
    let name = _id;
    if(request.body.hasOwnProperty('name')){
        name = request.body['name'];
    }
    dfgJson = convertGraphml2DFG(request.body["dfg"]);
    collection.replaceOne({"_id": `${_id}`}, {"_id": `${_id}`,"name": name, "dfg": dfgJson},{upsert: true}, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}

module.exports = importGraphmlAsDfg;