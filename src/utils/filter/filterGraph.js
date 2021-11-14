const isEmptyObject = require("../json/jsonEmpty.js")
const nodeEnv = process.env.NODE_ENV || 'development';
const logger = require('../log/log.js');
/**
 * Filter all the given graph with requestparameters
 * @param {Object} graphJSON - complete graph
 * @param {Array} variantsReq - Array of given variants to filter
 * @param {String} sequenceReq - on sequence to filter
 * @returns {Object} graphJSON - processed graph
 */
function filterGraph(graphJSON, variantsReq, sequenceReq) {
    logger.debug(`filter graph`);
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
    let smallestSum = 9999
    let biggestSum = 0
    /** Sequence is availible add Node-ID to Label, otherwise get frequency */
    if (isSequenceEmpty) {
        frequencyMap = getFrequencyMap(variantsGraphMap);
    } else {
        variantsReq = getVariantFromSequence(sequenceReq, variantsGraphMap);
    }
    /** Iterate trough graph data. Use the filters, if available */
    for (var i = 0; i < graphJSONconcrete.length; i++) {
        let graphData = graphJSONconcrete[i]["data"];
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
            if (graphData.hasOwnProperty("target")) { /** Is the element is an edge */
                graphData["sum"] = sum;
            }else {                                 /** The element is a node */
                newLine = "\n";
            }

            if (sum > biggestSum && !isStartOrEndNode(graphData["label"])) {
                biggestSum = sum;
            }
            if (sum < smallestSum && !isStartOrEndNode(graphData["label"])) {
                smallestSum = sum;
            }
            graphData["label"] = `${graphData["label"]}${newLine}${sum}`;
            
        } else {
            labelSequenceID(graphData, variantsReq, sequenceReq);
        }
        if (nodeEnv === 'production') {
            delete graphJSONconcrete[i]["data"]["variants"];
        }
    }
    if (isSequenceEmpty) {
        let spacingWidthArray = getSpacingWidth(smallestSum, biggestSum);
        for (var i = 0; i < graphJSONconcrete.length; i++) {
            let graphData = graphJSONconcrete[i]["data"];
            if(graphData["type"] === 'DirectedEdge'){
                for (value of spacingWidthArray) {
                    if (graphData["sum"] <= parseInt(value)) {
                        graphData["width"] = spacingWidthArray.indexOf(value) + 1;
                        if (nodeEnv === 'production') {
                            delete graphJSONconcrete[i]["data"]["sum"];
                        }
                        break;
                    }
                }
            }
        }
    }
}

/**
 * Check if Label is the start or end node
 * @param {String} graphDataLabel 
 * @returns {Boolean} 
 */
function isStartOrEndNode(graphDataLabel){
    return graphDataLabel === "Start" && graphDataLabel === "End";
}

/**
 * Build an Array with the needed interval between frequences
 * to get a naive gradation between arrow width
 * @param {Number} smallestSum 
 * @param {Number} biggestSum 
 * @returns {Array} Array with distance lengths
 */
function getSpacingWidth(smallestSum, biggestSum) {
    let spacingWidthArray = [];
    if (biggestSum < 10) {
        for (let i = 1; i <= biggestSum; i++) {
            spacingWidthArray.push(i);
        }
    } else {
        let value = (biggestSum - smallestSum) / 10

        for (let i = 1; i <= 10; i++) {
            spacingWidthArray.push(Math.round(value * i));
        }
    }
    return spacingWidthArray;
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
 * @param {String} variant - variant, which the sequence depends on
 * @param {String} sequenceReq  - requested sequence
 */
function labelSequenceID(graphData, variant, sequenceReq) {
    graphDataLabel = graphData["label"]
    if (graphDataLabel != "" && !isStartOrEndNode(graphDataLabel)) {
        graphData["label"] = `${graphDataLabel}\n${graphData["variants"][variant][sequenceReq]}`;
    }
}

module.exports = filterGraph;