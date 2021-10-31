const isEmptyObject = require("../json/jsonEmpty.js")


function filterVariants(graphJSON, variantsReq, sequenceReq) {
    filterConreteGraph(graphJSON["dfg"]["graph"], variantsReq, sequenceReq);
    //filterVariantsConrete(graphJSON.epc.graph, variants); // TODO
    //filterVariantsConrete(graphJSON.bpmn.graph, variants); // TODO

    return graphJSON
}

function filterConreteGraph(graphJSONconcrete, variantsReq, sequenceReq) {
    let isSequenceEmpty = isEmptyObject(sequenceReq);
    let isReqEmpty = isEmptyObject(variantsReq) && isSequenceEmpty;
    let variantsGraphMap = graphJSONconcrete[0]["data"]["variants"];
    let frequencyMap = {}
    if (isSequenceEmpty) {
        frequencyMap = getFrequencyMap(variantsGraphMap);
    } else {
        variantsReq = getVariantFromSequence(sequenceReq, variantsGraphMap);
    }
    for (var i = 0; i < graphJSONconcrete.length; i++) {      
        let graphData = graphJSONconcrete[i].data;
        let variantsGraph = Object.keys(graphData["variants"]);

        if (!(arrayEquals(variantsGraph, variantsReq)) && !isReqEmpty) {
            graphJSONconcrete.splice(i, 1);
            i--;
            continue;
        }
        if (isSequenceEmpty) {
            let sum = 0;
            for (const [key, value] of Object.entries(frequencyMap)) {
                if (variantsGraph.includes(key) && (variantsReq.includes(key) || isReqEmpty)) {
                    sum += value;
                }
            }
            let slash = "";
            if(graphData["type"] === "node"){
                slash = "/n";
            }
            graphData["label"] = `${graphData["label"]}${slash}${sum}`
        } else {
            labelSequenceID(graphData, variantsReq, sequenceReq);
        }
        //delete graphJSONconcrete[i]["data"]["variants"]; // Add this in Production Mode
    }
}

function arrayEquals(target, variants) {
    return target.some(v => variants.includes(v));
}

function getFrequencyMap(variants) {
    let keys = Object.keys(variants);
    let frequencyMap = {};
    keys.forEach(function (key) {
        frequencyMap[key] = Object.keys(variants[key]).length;
    });
    return frequencyMap;
}

function getVariantFromSequence(sequenceReq, variantsMap) {
    for (const [key, value] of Object.entries(variantsMap)) {
        for (let sequence in value) {
            if (sequence === sequenceReq) {
                return key;
            }
        }
    }
}

function labelSequenceID(graphData, variantsReq, sequenceReq) {
    graphDataLabel = graphData["label"]
    if (graphDataLabel != "" && graphDataLabel != "Start" && graphDataLabel != "Ende") {
        graphData["label"] = `${graphDataLabel} / ${graphData["variants"][variantsReq][sequenceReq]}`;
    }
}

module.exports = filterVariants;