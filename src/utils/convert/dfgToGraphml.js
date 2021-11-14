const logger = require('../log/log.js');

/**
 * Convert dfg Object to graphml
 * @param {Number} graphJSONID SAP-ID
 * @param {Object} dfg dfg-graph
 * @returns {String} Contains dfg in graphml format
 */
function convertDFG2Graphml(graphJSONID, dfg) {
    logger.debug(`convert dfg to graphml`);
    let xmlString = xmlHead;
    let graphId = graphJSONID
    xmlString += `<graph id="${graphId}" edgedefault="directed">`
    for (var i = 0; i < dfg.length; i++) {
        let graphData = dfg[i]["data"];
        let variants = JSON.stringify(graphData["variants"]);
        if (!graphData.hasOwnProperty("target")){
            let id = graphData["id"];
            let label = graphData["label"].split("\n");;            
            xmlString += `<node id="${id}">\n`
            xmlString += `<data key="label">${label[0]}</data>\n`
            xmlString += `<data key="variants">${variants}</data>\n`
            xmlString += `</node>`
        }else{
            let source = graphData["source"];
            let target = graphData["target"];
            xmlString += `<edge id="${i}" source="${source}" target="${target}">`
            xmlString += `<data key="variants">${variants}</data>\n`
            xmlString += `</edge>`
        }
    }
    xmlString += `</graph></graphml>`
    return xmlString
}

const xmlHead = `<?xml version="1.0" encoding="UTF-8"?>
    <graphml xmlns="http://graphml.graphdrawing.org/xmlns"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
    http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
    <key attr.name="label" attr.type="string" for="node" id="label"/>
    <key attr.name="variants" attr.type="string" for="node" id="variants" />
    <key attr.name="variants" attr.type="string" for="edge" id="variants" />`

module.exports = convertDFG2Graphml;