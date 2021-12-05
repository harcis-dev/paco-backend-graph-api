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

    for (epmlEvent of epmlEventList) {
        let id = epmlEvent["id"];
        if(epmlEvent["data"] instanceof Array){  /** with label and variants */
            let label = epmlEvent["data"][0]["$t"]; 
            let variants = JSON.parse(epmlEvent["data"][1]["$t"]);
            graphDataArray.push({ "data": { "id": id, "label": label, "type": "Event", "variants": variants } })
        }else{                              /** only label */
            let label = epmlEvent["name"]["$t"];
            graphDataArray.push({ "data": { "id": id, "label": label, "type": "Event"} })
        }
        
    }

    for (epmlFunction of epmlFunctionList) {
        let id = epmlFunction["id"];
        if(epmlFunction["data"] instanceof Array){  /** with label and variants */
            let label = epmlFunction["data"][0]["$t"]; 
            let variants = JSON.parse(epmlFunction["data"][1]["$t"]);
            graphDataArray.push({ "data": { "id": id, "label": label, "type": "Event", "variants": variants } })
        }else{                              /** only label */
            let label = epmlFunction["name"]["$t"];
            graphDataArray.push({ "data": { "id": id, "label": label, "type": "Function"} })
        }
        
    }

    if (typeof(epmlXorList) === 'Array'){
        for (epmlXor of epmlXorList) {
            let id = epmlXor["id"];
            if(epmlXor["data"] instanceof Array){  /** with label and variants */
                let label = epmlXor["data"][0]["$t"]; 
                let variants = JSON.parse(node["data"][1]["$t"]);
                graphDataArray.push({ "data": { "id": id, "label": label, "type": "Event", "variants": variants } })
            }else{                              /** only label */
                let label = epmlXor["name"]["$t"];
                graphDataArray.push({ "data": { "id": id, "label": label, "type": "Function"} })
            }
            
        }
    }else{
        let id = epmlXorList["id"];
        if(epmlXorList["data"] instanceof Array){  /** with label and variants */
            let label = epmlXorList["data"][0]["$t"]; 
            let variants = JSON.parse(epmlXorList["data"][1]["$t"]);
            graphDataArray.push({ "data": { "id": id, "label": label, "type": "Event", "variants": variants } })
        }else{                              /** only label */
            graphDataArray.push({ "data": { "id": id, "label": "X", "type": "XOR"} })
        }
    }


    for (epmlNode of epmlNodeList) {
        let source = epmlNode["flow"]["source"];
        let target = epmlNode["flow"]["target"];
        if(epmlNode.hasOwnProperty("data")){      /** with label and variants */
            let variants = JSON.parse(epmlNode["data"]["$t"]);
            graphDataArray.push({ "data": { "source": source, "target": target, "label": "", "type": "ControlFlow", "variants": variants } });         
        }else{                              /** only label */
            graphDataArray.push({ "data": { "source": source, "target": target, "label": "", "type": "ControlFlow"} });
        }  
    }

    return { "graph": graphDataArray };

}

module.exports = convertEpmlToJson;