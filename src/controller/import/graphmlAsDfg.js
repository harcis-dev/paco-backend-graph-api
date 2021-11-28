
const jsonParser = require("../../utils/json/jsonParser.js");
const logger = require('../../utils/log/log.js'); 
const convertGraphml2Json = require("../../utils/convert/dfg/graphmlToJson.js");

/**
 * Import XML-based graphml DFG, convert to JSON and persitant on databse
 * @param {*} request 
 * @param {*} response 
 */
function importGraphmlAsDfg(request, response){
    if(!request["body"].hasOwnProperty('_id')){
        return response.status(400).send("Error: Requestbody must contain _id");
    }
    if(!request["body"].hasOwnProperty('dfg')){
        return response.status(400).send("Error: Requestbody must contain dfg");
    }
    let _id = jsonParser(request["body"], "_id")
    if(!request["body"].hasOwnProperty('name')){
        request["body"]['name'] = _id
    }
    let name = request["body"]['name'];

    let dfgJson = convertGraphml2Json(request["body"]["dfg"]);
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