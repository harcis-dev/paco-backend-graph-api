const isEmptyObject = require("../json/jsonEmpty.js")

/**
 * Filter all the given graph with requestparameters
 * @param {Object} graphJSON - complete graph
 * @param {Array} variantsReq - Array of given variants to filter
 * @param {String} sequenceReq - on sequence to filter
 * @returns {Object} graphJSON - processed graph
 */
function filterGraph(graphJSON, variantsReq, sequenceReq) {
    filterConreteGraph(graphJSON["dfg"]["graph"], variantsReq, sequenceReq);
    //filterVariantsConrete(graphJSON.epc.graph, variants); // TODO
    //filterVariantsConrete(graphJSON.bpmn.graph, variants); // TODO

    return graphJSON
}

/**
 * Filter one concrete graph
 * @param {Object} graphJSON - complete graph
 * @param {Array|String} variantsReq - Array of given variants to filter - Changes to String if sequence is given
 * @param {String} sequenceReq - on sequence to filter, sequence got a higher priority, 
 * thats why sequence will overwrite variants-Array
 */
function filterConreteGraph(graphJSONconcrete, variantsReq, sequenceReq) {
    let isSequenceEmpty = isEmptyObject(sequenceReq);
    /** Check if Request is empty -> do not filter  */
    let isReqEmpty = isEmptyObject(variantsReq) && isSequenceEmpty;
    let variantsGraphMap = graphJSONconcrete[0]["data"]["variants"];
    let frequencyMap = {}
    /** Sequence is availible add Node-ID to Label, otherwise get frequency */
    if (isSequenceEmpty) {
        frequencyMap = getFrequencyMap(variantsGraphMap);
    } else {
        variantsReq = getVariantFromSequence(sequenceReq, variantsGraphMap);
    }
    /** Iterate trough graph data. Use the filters, if available */
    for (var i = 0; i < graphJSONconcrete.length; i++) {      
        let graphData = graphJSONconcrete[i].data;
        let variantsGraph = Object.keys(graphData["variants"]);
        /** Filter for variants. Delete data if not requested */
        if (!(checkArrayItem(variantsGraph, variantsReq)) && !isReqEmpty) {
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
            let newLine = "";
            if(graphData["type"] === "node"){
                newLine = "\n";
            }
            graphData["label"] = `${graphData["label"]}${newLine}${sum}`
        } else {
            labelSequenceID(graphData, variantsReq, sequenceReq);
        }
        /** Delete Variants-Information - not needed in production - mode */
        //delete graphJSONconcrete[i]["data"]["variants"]; // Add this in Production Mode
    }
}

/**
 * Check if target Array includes at least one item from variants array
 * @param {Array} target - Array to check
 * @param {Array} source - Array with given dependencies
 * @returns {Boolean} 
 */
function checkArrayItem(target, source) {
    return target.some(v => source.includes(v));
}

/**
 * Create a Map with variants and their existing count
 * @param {Object} variants 
 * @returns {Object} frequencyMap
 */
function getFrequencyMap(variants) {
    let keys = Object.keys(variants);
    let frequencyMap = {};
    keys.forEach(function (key) {
        frequencyMap[key] = Object.keys(variants[key]).length;
    });
    return frequencyMap;
}

/**
 * Get the key of a sequence to determinate the needed variant
 * @param {String} sequenceReq 
 * @param {Object} variant 
 * @returns {String} key
 */
function getVariantFromSequence(sequenceReq, variant) {
    for (const [key, value] of Object.entries(variant)) {
        for (let sequence in value) {
            if (sequence === sequenceReq) {
                return key;
            }
        }
    }
}

/**
 * Label the node with Node-ID
 * @param {Object} graphData - graph json
 * @param {String} variant - variant the sequence depends on
 * @param {String} sequenceReq  - requested sequence
 */
function labelSequenceID(graphData, variant, sequenceReq) {
    graphDataLabel = graphData["label"]
    if (graphDataLabel != "" && graphDataLabel != "Start" && graphDataLabel != "End") {
        graphData["label"] = `${graphDataLabel}\n${graphData["variants"][variant][sequenceReq]}`;
    }
}

module.exports = filterGraph;