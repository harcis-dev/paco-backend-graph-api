const parser = require('xml2json');

/**
 * Convert the given xml-String to an graph object 
 * @param {String} dfgXML 
 * @returns {Object} 
 */
function convertEpmlToJson(epml) {
    let graphEpml = epml.replace("\$", "\"");
    let graphJson = JSON.parse(parser.toJson(graphEpml));

    let graphDataArray = [];

    let epmlDirectory = graphJson["epml:epml"]["directory"]["epc"];
    let epmlEventList = epmlDirectory["event"];
    let epmlFunctionList = epmlDirectory["function"];
    let epmlXorList = epmlDirectory["xor"];
    let epmlNodeList = epmlDirectory["arc"];

    /** Node */
    graphDataArray = graphDataArray.concat(addEntitysToGraphData(epmlEventList, "Event"));
    graphDataArray = graphDataArray.concat(addEntitysToGraphData(epmlFunctionList, "Function"));
    graphDataArray = graphDataArray.concat(addEntitysToGraphData(epmlXorList, "XOR"));

    /** Edge */
    graphDataArray = graphDataArray.concat(addEdgesToGraphData(epmlNodeList, "ControlFlow"));

    return { "graph": graphDataArray };

}

function addEntitysToGraphData(entityList, entityType) {

    graphDataArrayTemp = []

    if (isArray(entityList)) {
        for (entity of entityList) {
            let label = entity["name"]["$t"];
            let id = entity["id"];
            if (entity.hasOwnProperty("attribute") && entity["attribute"]["typeRef"] === "variants") {  /** with label and variants */
                let variants = JSON.parse(entity["attribute"]["value"].replace(/'/g, "\""));
                graphDataArrayTemp.push({ "data": { "id": id, "label": label, "type": entityType, "variants": variants } })
            } else {                              /** only label */
                graphDataArrayTemp.push({ "data": { "id": id, "label": label, "type": entityType } })
            }

        }
    } else {
        let id = entityList["id"];
        let label = "";
        if(entityList.hasOwnProperty("name")){
            label = entityList["name"]["$t"];
        }
        
        if (entityList.hasOwnProperty("attribute") && entityList["attribute"]["typeRef"] === "variants") {  /** with label and variants */
            let variants = JSON.parse(entity["attribute"]["value"].replace(/'/g, "\""));
            graphDataArrayTemp.push({ "data": { "id": id, "label": label, "type": entityType, "variants": variants } })
        } else {                              /** only label */
            graphDataArrayTemp.push({ "data": { "id": id, "label": "X", "type": entityType } })
        }
    }

    return graphDataArrayTemp;
}

function addEdgesToGraphData(edgeList, edgeType) {

    graphDataArrayTemp = []
    if (isArray(edgeList)) {
        for (epmlEdge of edgeList) {
            let source = epmlEdge["flow"]["source"];
            let target = epmlEdge["flow"]["target"];
            if (epmlEdge.hasOwnProperty("attribute") && epmlEdge["attribute"]["typeRef"] === "variants") {      /** with label and variants */
                let variants = JSON.parse(entity["attribute"]["value"].replace(/'/g, "\""));
                graphDataArrayTemp.push({ "data": { "source": source, "target": target, "label": "", "type": edgeType, "variants": variants } });
            } else {                              /** only label */
                graphDataArrayTemp.push({ "data": { "source": source, "target": target, "label": "", "type": edgeType } });
            }
        }
    } else {
        let source = edgeList["flow"]["source"];
        let target = edgeList["flow"]["target"];
        if (edgeList.hasOwnProperty("attribute") && edgeList["attribute"]["typeRef"] === "variants") {      /** with label and variants */
            let variants = JSON.parse(entity["attribute"]["value"].replace(/'/g, "\""));
            graphDataArrayTemp.push({ "data": { "source": source, "target": target, "label": "", "type": edgeType, "variants": variants } });
        } else {                              /** only label */
            graphDataArrayTemp.push({ "data": { "source": source, "target": target, "label": "", "type": edgeType } });
        }
    }

    return graphDataArrayTemp;
}

function isArray(object) {
    return Object.prototype.toString.call(object) === '[object Array]';
}

module.exports = convertEpmlToJson;