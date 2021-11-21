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
    if(!Array.isArray(variantsReq)){
        throw Error("variants must be an array")
    }
    if(!(typeof sequenceReq === 'string' || sequenceReq instanceof String)){
        throw Error("sequence must be an string")
    }
    if(graphJSON.hasOwnProperty("dfg")){
        filterConreteGraph(graphJSON["dfg"]["graph"], variantsReq, sequenceReq);
    }
    if(graphJSON.hasOwnProperty("epc")){
        filterConreteGraph(graphJSON["epc"]["graph"], variantsReq, sequenceReq); 
    }

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
    if(! graphJSONconcrete[0]["data"].hasOwnProperty("variants")){ /** No variants and sequences availible to filter */
        return;
    }
    let isSequenceEmpty = isEmptyObject(sequenceReq);
    /** Check if Request is empty -> do not filter  */
    let isReqEmpty = isEmptyObject(variantsReq) && isSequenceEmpty;
    let frequencyMap = {};
    let variantsGraphMap = graphJSONconcrete[0]["data"]["variants"];


    /** if Sequence is availible add Node-ID to Label, otherwise get frequency */
    if (isSequenceEmpty) {
        frequencyMap = getFrequencyMap(variantsGraphMap);
    } else {
        variantsReq = getVariantFromSequence(sequenceReq, variantsGraphMap);
        if(typeof query == 'undefined' || query == null){
            throw Error ('Sequence not found')
        }
    }
    /** Iterate trough graph data. Use the filters, if available */
    sum = getEntityFrequency(graphJSONconcrete, frequencyMap, variantsReq, isReqEmpty, isSequenceEmpty, sequenceReq);
    
    if (isSequenceEmpty) {  /** If empty, add arrowwidth on edges */
        let smallestSum = sum["smallestSum"];
        let biggestSum = sum["biggestSum"];
        let frequencyArrowwidth = sum["frequencyArrowwidth"];
        let spacingWidthArray = getSpacingWidth(smallestSum, biggestSum, frequencyArrowwidth);
        setGraphArrowwidth(graphJSONconcrete, spacingWidthArray);
    }
}

/**
 * Determine the frequency of every entity, if @param {String} sequenceReq is empty and add the frequency to entities, 
 * else label every entity with existing Node-ID
 * @param {Object} graphJSONconcrete 
 * @param {Object} frequencyMap 
 * @param {Array} variantsReq 
 * @param {Boolean} isReqEmpty 
 * @param {Boolean} isSequenceEmpty 
 * @param {String} sequenceReq 
 * @returns {Object} parameters, for arrowwidth handling
 */
function getEntityFrequency(graphJSONconcrete, frequencyMap, variantsReq, isReqEmpty, isSequenceEmpty, sequenceReq){
    let frequencyArrowwidth = [];
    let smallestSum = 4294967295;
    let biggestSum = 0;
    for (var i = 0; i < graphJSONconcrete.length; i++) {
        let graphData = graphJSONconcrete[i]["data"];
        let variantsGraph = Object.keys(graphData["variants"]);
        if(!graphData.hasOwnProperty("label")){
            graphData["label"] = ""
        }
        /** Filter for variants. Delete data if not requested */
        if (!(checkArrayItem(variantsGraph, variantsReq)) && !isReqEmpty) {
            graphJSONconcrete.splice(i, 1);
            i--;
            continue;
        }
        if (isSequenceEmpty) {  /** Analyse Entities and get frequency for every entity */
            let sum = 0;
            for (const [key, value] of Object.entries(frequencyMap)) {
                if (variantsGraph.includes(key) && (variantsReq.includes(key) || isReqEmpty)) {
                    sum += value;
                }
            }
            if(!frequencyArrowwidth.includes(sum)){    /** Check if sum-Value already in "Set-Array" */
                frequencyArrowwidth.push(sum);
            }    
            let newLine = "";
            if (graphData.hasOwnProperty("target")) { /** Is the element an edge */
                graphData["sum"] = sum;
            }else {                                 /** The element is a node  */
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
    return {"biggestSum": biggestSum, "smallestSum": smallestSum, "frequencyArrowwidth": frequencyArrowwidth};
}

/**
 * Select the arrowwidth on every edge in the graph
 * @param {Object} graphJSONconcrete 
 * @param {Array} spacingWidthArray 
 */
function setGraphArrowwidth(graphJSONconcrete, spacingWidthArray){
    for (var i = 0; i < graphJSONconcrete.length; i++) {
        let graphData = graphJSONconcrete[i]["data"];
        if(graphData.hasOwnProperty("target")){ /** Is edge */
            for (value of spacingWidthArray) {  
                if (graphData["sum"] <= parseInt(value)) {  /** check if sum of element is smaller or equal of given sum values */
                    graphData["width"] = spacingWidthArray.indexOf(value) + 1;  /** add index of value as arrowwidth to element */
                    if (nodeEnv === 'production') {
                        delete graphJSONconcrete[i]["data"]["sum"];     
                    }
                    break;      /** appropriate value found */
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
 * @param {Number} smallestSum  smallest analysed sum
 * @param {Number} biggestSum biggest analysed sum
 * @param {Array} frequencyArrowwidth Array Set with diffrent sum
 * @returns {Array} Array with distance lengths
 */
function getSpacingWidth(smallestSum, biggestSum, frequencyArrowwidth) {
    let spacingWidthArray = [];
    let frequencyArrowwidthLength =  frequencyArrowwidth.length;
    let sum = biggestSum - smallestSum;

    if (frequencyArrowwidthLength <= 10) {  /** Only max. 10 diffrent sum-Values in set-array */
        for (let i = 0; i <= frequencyArrowwidthLength; i++) {
            spacingWidthArray.push(frequencyArrowwidth[i]);
        }
    } else {
        let value = sum / 10            /** Grading arrowwith for every 1/10 of sum  */

        for (let i = 1; i <= 10; i++) {
            spacingWidthArray.push(Math.round(value * i));
        }
    }
    return spacingWidthArray.sort();
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