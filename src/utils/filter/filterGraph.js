/**
 * @file Filter graph with parameters
 * @author HARCIS-DEV TEAM
 */

const jsonUtils = require("../jsonUtils.js");
const nodeEnv = process.env.NODE_ENV || "development";
const logger = require("../log/log.js");

const graphTypeEnum = Object.freeze({
  DFG: 1,
  EPC: 2,
  BPMN: 3,
});

/**
 * Filter all the given graph with requestparameters
 * @param {Object} graphJSON - complete graph
 * @param {Array} variantsReq - Array of given variants to filter
 * @param {String} sequenceReq - on sequence to filter
 * @returns {Object} graphJSON - processed graph
 */
function filterGraph(graphJSON, variantsReq, sequenceReq) {
  logger.debug(`filter graph`);
  if (!Array.isArray(variantsReq)) {
    throw Error("variants must be an array");
  }
  if (!(typeof sequenceReq === "string" || sequenceReq instanceof String)) {
    throw Error("sequence must be an string");
  }
  if (graphJSON.hasOwnProperty("dfg")) {
    filterConreteGraph(
      graphJSON["dfg"]["graph"],
      variantsReq,
      sequenceReq,
      graphTypeEnum.DFG
    );
  }
  if (graphJSON.hasOwnProperty("epc")) {
    filterConreteGraph(
      graphJSON["epc"]["graph"],
      variantsReq,
      sequenceReq,
      graphTypeEnum.EPC
    );
  }
  if (graphJSON.hasOwnProperty("bpmn")) {
    filterConreteGraph(
      graphJSON["bpmn"]["graph"],
      variantsReq,
      sequenceReq,
      graphTypeEnum.BPMN
    );
  }

  return graphJSON;
}

/**
 * Filter one concrete graph
 * @param {Object} graphJSON - complete graph
 * @param {Array | String} variantsReq - Array of given variants to filter - Changes to String if sequence is given
 * @param {String} sequenceReq - on sequence to filter, sequence got a higher priority,
 * thats why sequence will overwrite variants-Array
 */
function filterConreteGraph(
  graphJSONconcrete,
  variantsReq,
  sequenceReq,
  graphType
) {
  if (!graphJSONconcrete[0]["data"].hasOwnProperty("variants")) {
    /** No variants and sequences availible to filter */
    return;
  }
  let isSequenceEmpty = jsonUtils.isEmptyObject(sequenceReq);
  /** Check if Request is empty -> do not filter  */
  let isReqEmpty = jsonUtils.isEmptyObject(variantsReq) && isSequenceEmpty;
  let frequencyMap = {};
  let variantsGraphMap = graphJSONconcrete[0]["data"]["variants"];

  /** if Sequence is availible add Node-ID to Label, otherwise get frequency */
  if (isSequenceEmpty) {
    frequencyMap = getFrequencyMap(variantsGraphMap);
  } else {
    variantsReq = getVariantFromSequence(sequenceReq, variantsGraphMap);
    if (typeof variantsReq == "undefined" || variantsReq == null) {
      throw Error("Sequence not found");
    }
  }
  /** Iterate trough graph data. Use the filters, if available */
  sum = getEntityFrequency(
    graphJSONconcrete,
    frequencyMap,
    variantsReq,
    isReqEmpty,
    isSequenceEmpty,
    sequenceReq,
    graphType
  );

  if (isSequenceEmpty) {
    /** If empty, add edgewidth on edges */
    let smallestSum = sum["smallestSum"];
    let biggestSum = sum["biggestSum"];
    let frequencyEdgeWidth = sum["frequencyEdgeWidth"];
    let spacingWidthArray = getSpacingWidth(
      smallestSum,
      biggestSum,
      frequencyEdgeWidth
    );
    setGraphEdgeWidth(graphJSONconcrete, spacingWidthArray);
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
 * @returns {Object} parameters, for edgewidth handling
 */
function getEntityFrequency(
  graphJSONconcrete,
  frequencyMap,
  variantsReq,
  isReqEmpty,
  isSequenceEmpty,
  sequenceReq,
  graphType
) {
  let frequencyEdgeWidth = [];
  let smallestSum = Number.MAX_VALUE;
  let biggestSum = 0;
  let deletedOperatorIds = [];
  let markedIndexSource = [];
  let markedIndexTarget = [];
  let isOperatorIrrelevant = !isSequenceEmpty || variantsReq.length == 1;
  let areAllVariantsRepresented = (
    variantsReq.length == 0 ||
    variantsReq.length == graphJSONconcrete[0]["data"]["variants"].length
  );
  let markedOperatorsIndexMap = {};
  let markedOperatorsMap = {};
  for (var i = 0; i < graphJSONconcrete.length; i++) {
    let graphEntityData = graphJSONconcrete[i]["data"];
    let graphEntityDataType = graphEntityData["type"];
    let graphEntityDataID = graphEntityData["id"];
    let dataEntityVariants = Object.keys(graphEntityData["variants"]);
    if (!graphEntityData.hasOwnProperty("label")) {
      graphEntityData["label"] = "";
    }

    /**
     * Check if all variants have been requested. 
     * If not, delete the corresponding operators.
     */
    if (!areAllVariantsRepresented) {
      /** Filter for variants. Delete data if not requested */
      if (!checkArrayItem(dataEntityVariants, variantsReq) && !isReqEmpty) {
        graphJSONconcrete.splice(i, 1);
        i--;
        continue;
      }

      if (graphType === graphTypeEnum.EPC) {

          /**
           * If the query contains only one variant, 
           * it is impossible for a single sequence to contain operators.
           */
        if (isOperatorIrrelevant) {
          if (isOperatorEPC(graphEntityDataType)) {
            deletedOperatorIds.push(graphEntityDataID);
            graphJSONconcrete.splice(i, 1);
            i--;
            continue;
          }

          if (
            graphEntityData.hasOwnProperty("source") &&
            graphEntityData.hasOwnProperty("target")
          ) {
            let source = graphEntityData["source"];
            let target = graphEntityData["target"];

            if (deletedOperatorIds.includes(source)) {
              markedIndexTarget.push({
                i: i,
              });
            }

            if (deletedOperatorIds.includes(target)) {
              graphJSONconcrete.splice(i, 1);
              i--;
              markedIndexSource.push({
                source: source,
              });
            }
          }
        
          /**
           * Several, but not all, variants are available in the request. 
           * Individual check whether the respective operators are required.
           */
        }else{
            if (isOperatorEPC(graphEntityDataType)){
                markedOperatorsIndexMap[graphEntityDataID] = i;
            } else if(isInformationFlowEPC(graphEntityDataType)){
                let edgeContainsOperator = false;
                let operatorID = "";
                let graphEntityDataSource = graphEntityData["source"];
                let graphEntityDataTarget = graphEntityData["target"];
                if(Object.keys(markedOperatorsIndexMap).includes(graphEntityDataSource)){
                    edgeContainsOperator = true;
                    operatorID = graphEntityDataSource;
                }else if(Object.keys(markedOperatorsIndexMap).includes(graphEntityDataTarget)){
                    edgeContainsOperator = true;
                    operatorID = graphEntityDataTarget;
                }
                if(edgeContainsOperator){
                    let edgeElement = {"edgeID": graphEntityDataID, "edgeIndex": i, "source": graphEntityDataSource, "target": graphEntityDataTarget};
                    let operatorObject = {"operatorIndex": markedOperatorsIndexMap[operatorID],"operatorVariants": graphEntityData["variants"], "edgeArray":[edgeElement]};
                    if(Object.keys(markedOperatorsMap).includes(operatorID)){
                        let operatorEdgeArray = markedOperatorsMap[operatorID]["edgeArray"];
                        operatorEdgeArray.push(edgeElement);
                        operatorObject["edgeArray"] = operatorEdgeArray;                       
                    } 
                    markedOperatorsMap[operatorID] = operatorObject;               
                }

            }
            
        }
      } else if (isOperatorIrrelevant && graphType === graphTypeEnum.BPMN) {
        if (isOperatorBPMN(graphEntityDataType)) {
          deletedOperatorIds.push(graphEntityDataID);
          graphJSONconcrete.splice(i, 1);
          i--;
          continue;
        }

        if (
          graphEntityData.hasOwnProperty("source") &&
          graphEntityData.hasOwnProperty("target")
        ) {
          let source = graphEntityData["source"];
          let target = graphEntityData["target"];

          if (deletedOperatorIds.includes(source)) {
            markedIndexTarget.push({
              i: i,
            });
          }

          if (deletedOperatorIds.includes(target)) {
            graphJSONconcrete.splice(i, 1);
            i--;
            markedIndexSource.push({
              source: source,
            });
          }
        }
      }
    }

      if (isSequenceEmpty) {
        /** Analyse Entities and get frequency for every entity */
        let sum = 0;
        for (const [key, value] of Object.entries(frequencyMap)) {
          if (
            dataEntityVariants.includes(key) &&
            (variantsReq.includes(key) || isReqEmpty)
          ) {
            sum += value;
          }
        }
        if (!frequencyEdgeWidth.includes(sum)) {
          /** Check if sum-Value already in "Set-Array" */
          frequencyEdgeWidth.push(sum);
        }
        let newLine = "";
        if (graphEntityData.hasOwnProperty("target")) {
          /** Is the element an edge */
          graphEntityData["sum"] = sum;
        } else {
          /** The element is a node  */
          newLine = "\n";
        }

        if (sum > biggestSum && !isStartOrEndNode(graphEntityData["label"])) {
          biggestSum = sum;
        }
        if (sum < smallestSum && !isStartOrEndNode(graphEntityData["label"])) {
          smallestSum = sum;
        }
        graphEntityData[
          "label"
        ] = `${graphEntityData["label"]}${newLine}${sum}`;
      } else {
        labelSequenceID(graphEntityData, variantsReq, sequenceReq);
      }
      if (nodeEnv === "production") {
        delete graphJSONconcrete[i]["data"]["variants"];
      }
    
  }

  for(operator in markedOperatorsMap){
      let edgeObject = markedOperatorsMap[operator];
      let edgeArray = edgeObject["edgeArray"];
      if(edgeArray.length == 2){
          let source = "";
          let target = "";
          let newEgdeID = "";
          let substractIndex = 0;
          for (operatorEdgeIndex in edgeArray){           
              let edgeElement = edgeArray[operatorEdgeIndex];
            if(edgeElement["source"] == operator){
                target = edgeElement["target"];
            }else  if(edgeElement["target"] == operator){
                source = edgeElement["source"];
            }
            graphJSONconcrete.splice(edgeElement["edgeIndex"] - substractIndex, 1);
            substractIndex++;
          }
          graphJSONconcrete.splice(edgeObject["operatorIndex"], 1);
          newEgdeID = `${source}->${target}`;
          let newEdge = {"data":{"id": newEgdeID, "source": source, "target": target, "type": "InformationFlow", "variants":edgeObject["operatorVariants"] }};
          graphJSONconcrete.push(newEdge);

      }
    }

  for (let i = 0; i < markedIndexTarget.length; i++) {
    graphJSONconcrete[markedIndexTarget[i]["i"]]["data"]["source"] =
      markedIndexSource[i]["source"];
  }
  return {
    biggestSum: biggestSum,
    smallestSum: smallestSum,
    frequencyEdgeWidth: frequencyEdgeWidth,
  };
}

/**
 * Check if type is:
 * - "or"
 * - "and"
 * - "xor"
 * @param {string} type
 * @returns {boolean}
 */
function isOperatorEPC(type) {
  type = type.toLowerCase();
  return type === "or" || type === "and" || type === "xor";
}

/**
 * Check if type is:
 * - "informationflow"
 * @param {string} type
 * @returns {boolean}
 */
function isInformationFlowEPC(type){
    return type.toLowerCase() == "informationflow";
}

/**
 * Check if type is:
 * - "Parallel"
 * - "Exclusive"
 * - "Inclusive"
 * @param {string} type
 * @returns {boolean}
 */
function isOperatorBPMN(type) {
  return type === "Parallel" || type === "Exclusive" || type === "Inclusive";
}

/**
 * Select the edgewidth on every edge in the graph
 * @param {Object} graphJSONconcrete
 * @param {Array} spacingWidthArray
 */
function setGraphEdgeWidth(graphJSONconcrete, spacingWidthArray) {
  for (var i = 0; i < graphJSONconcrete.length; i++) {
    let graphData = graphJSONconcrete[i]["data"];
    if (graphData.hasOwnProperty("target")) {
      /** Is edge */
      for (value of spacingWidthArray) {
        if (graphData["sum"] <= parseInt(value)) {
          /** check if sum of element is smaller or equal of given sum values */
          graphData["width"] =
            spacingWidthArray.indexOf(value) +
            1; /** add index of value as edgewidth to element */
          if (nodeEnv === "production") {
            delete graphJSONconcrete[i]["data"]["sum"];
          }
          break; /** appropriate value found */
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
function isStartOrEndNode(graphDataLabel) {
  return graphDataLabel === "Start" || graphDataLabel === "End";
}

/**
 * Build an Array with the needed interval between frequences
 * to get a naive gradation between edge width
 * @param {Number} smallestSum  smallest analysed sum
 * @param {Number} biggestSum biggest analysed sum
 * @param {Array} frequencyEdgeWidth Array Set with diffrent sum
 * @returns {Array} Array with distance lengths
 */
function getSpacingWidth(smallestSum, biggestSum, frequencyEdgeWidth) {
  const sumValues = 10;

  let spacingWidthArray = [];
  let frequencyEdgeWidthLength = frequencyEdgeWidth.length;
  let sum = biggestSum - smallestSum;

  if (frequencyEdgeWidthLength <= sumValues) {
    /** Only max. sumValues diffrent sum-Values in set-array */
    for (let i = 0; i <= frequencyEdgeWidthLength; i++) {
      spacingWidthArray.push(frequencyEdgeWidth[i]);
    }
  } else {
    let value =
      sum / sumValues; /** Grading edgewith for every 1/sumValues of sum  */

    for (let i = 1; i <= sumValues; i++) {
      spacingWidthArray.push(Math.round(value * i));
    }

    spacingWidthArray[spacingWidthArray.length - 1] = biggestSum + 1;
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
  return target.some((v) => source.includes(v));
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
  graphDataLabel = graphData["label"];
  if (graphDataLabel != "" && !isStartOrEndNode(graphDataLabel)) {
    graphData[
      "label"
    ] = `${graphDataLabel}\n${graphData["variants"][variant][sequenceReq]}`;
  }
}

module.exports = filterGraph;
