
const jsonParser = require("../../utils/json/jsonParser.js");
const logger = require('../../utils/log/log.js'); 

/**
 * Insert graph with @param {String} _id if not exist, Replace graph if @param {String} _id exist
 * return Response with accpeted or failed answer
 */
function upsertGraph(request, response){
    _id = jsonParser(request.body, "_id")
    if(!request.body.hasOwnProperty('name')){
        request.body['name'] = _id
    }
    collection.replaceOne({"_id": `${_id}`}, request.body,{upsert: true}, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}

module.exports = upsertGraph;