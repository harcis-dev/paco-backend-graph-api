const parser = require('xml2json');


function convertGraphml2DFG(reqBody) {
    let graphXml = reqBody.dfg.replace("\$", "\"");
    let graphJson = JSON.parse(parser.toJson(graphXml));
    
    let graphDataArray = [];

    let nodeList = graphJson["graphml"]["graph"]["node"];
    for (node of nodeList) {
        let id = node["id"];
        let label = node["data"][0]["$t"];
        let variants = JSON.parse(node["data"][1]["$t"]);
        graphDataArray.push({ "data": { "id": id, "label": label, "type": "node", "variants": variants } })
    }

    let edgeList = graphJson["graphml"]["graph"]["edge"];
    for (edge of edgeList) {
        let source = edge["source"];
        let target = edge["target"];
        let variants = JSON.parse(edge["data"]["$t"]);
        graphDataArray.push({ "data": { "source": source, "target": target, "label": "", "type": "DirectedEdge", "variants": variants } });
    }

    return { "graph": graphDataArray };

}

module.exports = convertGraphml2DFG;