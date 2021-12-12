/**
 * @file Import structures for:
 * - json {dfg, epc, bpmn}
 * - graphml {dfg}
 * - epml {epc}
 * @author HARCIS-DEV TEAM
 */

const jsonUtils = require("../../utils/jsonUtils.js");
const logger = require('../../utils/log/log.js');
const convertGraphmlToJson = require("../../utils/convert/dfg/graphmlToJson.js");
const convertEpmlToJson = require("../../utils/convert/epc/epmlToJson.js");

/**
 * Import any given graph to database
 * @param {*} request 
 * @param {*} response 
 */
function importGraph(request, response) {
    if (!request["body"].hasOwnProperty('_id')) {
        return response.status(400).send("Error: Requestbody must contain _id");
    }
    modell = checkForModell(request);
    if (!modell) {
        return response.status(400).send("Error: Requestbody must contain dfg, epc or bpmn");
    }
    let _id = jsonUtils.getKeyFromJsonString(request["body"], "_id")
    if (!request["body"].hasOwnProperty('name')) {
        request["body"]['name'] = _id
    }
    let name = request["body"]['name'];

    let graphJson;

    switch (modell) {
        case "dfg":
            graphJson = convertGraphmlToJson(request["body"]["dfg"]);
            break;
        case "epc":
            graphJson = convertEpmlToJson(request["body"]["epc"]);
            break;
        case "bpmn":
            //graphJson = convertGraphml2Json(request["body"]["bpmn"]);
            break;
    }
    query = {
        "_id": `${_id}`,
        "name": name,
        [modell]: graphJson
    };
    collection.replaceOne({
        "_id": `${_id}`
    }, query, {
        upsert: true
    }, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}

function checkForModell(request) {
    if (request["body"].hasOwnProperty('dfg')) {
        return "dfg";
    }
    if (request["body"].hasOwnProperty('epc')) {
        return "epc";
    }
    if (request["body"].hasOwnProperty('bpmn')) {
        return "bpmn";
    }
    return "";
}

module.exports = importGraph;