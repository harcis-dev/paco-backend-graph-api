const parser = require('xml2json');

/**
 * Convert the given xml-String to an graph object 
 * @param {String} dfgXML 
 * @returns {Object} 
 */
function convertGraphml2Json(dfgXML) {
    let graphXml = dfgXML.replace("\$", "\"");
    let graphJson = JSON.parse(parser.toJson(graphXml));

    let graphDataArray = [];

    let nodeList = graphJson["graphml"]["graph"]["node"];
    for (node of nodeList) {
        let id = node["id"];
        if(node["data"] instanceof Array){  /** with label and variants */

            let label = node["data"][0]["$t"]; 
            let variants = JSON.parse(node["data"][1]["$t"]);

            graphDataArray.push({ "data": { "id": id, "label": label, "type": "node", "variants": variants } })
        }else{                              /** only label */

            let label = node["data"]["$t"];

            graphDataArray.push({ "data": { "id": id, "label": label, "type": "node"} })
        }
        
    }

    let edgeList = graphJson["graphml"]["graph"]["edge"];
    for (edge of edgeList) {

        let source = edge["source"];
        let target = edge["target"];

        if(edge.hasOwnProperty("data")){      /** with label and variants */

            let variants = JSON.parse(edge["data"]["$t"]);
            
            graphDataArray.push({ "data": { "source": source, "target": target, "label": "", "type": "DirectedEdge", "variants": variants } });         
        }else{                              /** only label */
            graphDataArray.push({ "data": { "source": source, "target": target, "label": "", "type": "DirectedEdge"} });
        }  
    }

    return { "graph": graphDataArray };

}

module.exports = convertGraphml2Json;