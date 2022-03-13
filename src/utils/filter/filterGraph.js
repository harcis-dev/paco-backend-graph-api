/**
 * @file Filter graph with parameters
 * @author HARCIS-DEV TEAM
 */

const jsonUtils = require("../jsonUtils.js");
const nodeEnv = process.env.NODE_ENV || "development";
const logger = require("../log/log.js");
const globalParameter = require("../../global/global.js");

const graphTypeEnum = globalParameter.graphTypeEnum;
const epcEnum = globalParameter.epcEnum;
const bpmnEnum = globalParameter.bpmnEnum;
const graphArtefacts = globalParameter.graphArtefacts;
const environment = globalParameter.environment;

/**
 * Filter all the given graph with requestparameters
 * @param {Object} graphJSON - complete graph
 * @param {Array} variantsReq - Array of given variants to filter
 * @param {String} sequenceReq - on sequence to filter
 * @param {Array} graphTypesRequest - Request for the required graphs
 * @param {Number} nodes - Filter graph by the number of nodes
 * @returns {Object} graphJSON - processed graph
 */
function filterGraph(graphJSON, variantsReq, sequenceReq, graphTypesRequest, nodes) {
  if (typeof graphTypesRequest === "undefined" || graphTypesRequest === null) {
    graphTypesRequest = Object.values(globalParameter.graphTypeEnum);
  }
  graphTypesRequest = graphTypesRequest.map(function (arrayStringToLower) {
    return arrayStringToLower.toLowerCase();
  });
  logger.debug(`filter graph`);
  if (!Array.isArray(variantsReq)) {
    throw Error("variants must be an array");
  }
  if (!(typeof sequenceReq === "string" || sequenceReq instanceof String)) {
    throw Error("sequence must be an string");
  }
  if (!(typeof nodes === "number" || nodes instanceof Number)) {
    throw Error("nodes must be an number");
  }

  for (let graphType in graphTypeEnum) {
    graphType = graphTypeEnum[graphType];
    if (!graphTypesRequest.includes(graphType)) {
      delete graphJSON[graphType];
    } else if (graphJSON.hasOwnProperty(graphType)) {
      if(nodes >= 0){
        variantsReq = getVariantsFromNodes(graphJSON, graphType, nodes);
      }
    
      filterConreteGraph(
        graphJSON[graphType][graphArtefacts.GRAPH],
        variantsReq,
        sequenceReq,
        graphType
      );
    }
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
  if (
    !graphJSONconcrete[0][graphArtefacts.DATA].hasOwnProperty(
      graphArtefacts.VARIANTS
    )
  ) {
    /** No variants and sequences availible to filter */
    return;
  }
  let isSequenceEmpty = jsonUtils.isEmptyObject(sequenceReq);
  /** Check if Request is empty -> do not filter  */
  let isReqEmpty = jsonUtils.isEmptyObject(variantsReq) && isSequenceEmpty;
  let frequencyMap = {};
  let variantsGraphMap =
    graphJSONconcrete[0][graphArtefacts.DATA][graphArtefacts.VARIANTS];

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
  /**
   * Determine the smallest pass numbers for later determination of the arrow size.
   */
  let smallestSum = Number.MAX_VALUE;
  /**
   * Determine the biggest pass numbers for later determination of the arrow size.
   */
  let biggestSum = 0;
  /**
   * Array in which the deleted operator ids are present if @isOperatorIrrelevant is true.
   */
  let deletedOperatorIds = [];
  /**
   * Marked places of the origin nodes
   */
  let markedIndexSource = [];
  /**
   * Marked locations of the target nodes
   */
  let markedIndexTarget = [];
  /**
   * With only one variant, all operators are deleted.
   */
  let isOperatorIrrelevant = !isSequenceEmpty || variantsReq.length == 1;
  /**
   * If all variants are present, filtering of operators is skipped.
   */
  let areAllVariantsRepresented =
    variantsReq.length == 0 ||
    variantsReq.length ==
      graphJSONconcrete[0][graphArtefacts.DATA][graphArtefacts.VARIANTS].length;
  /**
   * Contains ID of the operator, as well as the index in the graph
   */
  let markedOperatorsIndexMap = {};
  /**
   * Contains the information of an operator, as well as the related edges
   */
  let markedOperatorsMap = {};

  for (var i = 0; i < graphJSONconcrete.length; i++) {
    let graphEntityData = graphJSONconcrete[i][graphArtefacts.DATA];
    let graphEntityDataType = graphEntityData[graphArtefacts.TYPE];
    let graphEntityDataID = graphEntityData[graphArtefacts.ID];
    let dataEntityVariants = Object.keys(
      graphEntityData[graphArtefacts.VARIANTS]
    );
    if (!graphEntityData.hasOwnProperty(graphArtefacts.LABEL)) {
      graphEntityData[graphArtefacts.LABEL] = "";
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

      /**
       * If the query contains only one variant,
       * it is impossible for a single sequence to contain operators.
       */
      if (
        (graphType === graphTypeEnum.EPC || graphType === graphTypeEnum.BPMN) &&
        isOperatorIrrelevant
      ) {
        if (
          isOperatorEPC(graphEntityDataType) ||
          isOperatorBPMN(graphEntityDataType)
        ) {
          deletedOperatorIds.push(graphEntityDataID);
          graphJSONconcrete.splice(i, 1);
          i--;
          continue;
        }

        if (
          graphEntityData.hasOwnProperty(graphArtefacts.SOURCE) &&
          graphEntityData.hasOwnProperty(graphArtefacts.TARGET)
        ) {
          let source = graphEntityData[graphArtefacts.SOURCE];
          let target = graphEntityData[graphArtefacts.TARGET];

          if (
            deletedOperatorIds.includes(source) &&
            deletedOperatorIds.includes(target)
          ) {
            markedIndexTarget.push({
              i: i,
              source: source,
              target: target,
              opToOp: true,
            });
          } else if (deletedOperatorIds.includes(source)) {
            markedIndexTarget.push({
              i: i,
              source: source,
              target: target,
              opToOp: false,
            });
          } else if (deletedOperatorIds.includes(target)) {
            graphJSONconcrete.splice(i, 1);
            i--;
            markedIndexSource.push({
              source: source,
              target: target,
              opToOp: false,
            });
          }
        }
      }

      /**
       * Delete the not needed operators, if not all variants are addressed
       */
      if (
        (graphType === graphTypeEnum.EPC || graphType === graphTypeEnum.BPMN) &&
        !isOperatorIrrelevant
      ) {
        if (
          isOperatorEPC(graphEntityDataType) ||
          isOperatorBPMN(graphEntityDataType)
        ) {
          markedOperatorsIndexMap[graphEntityDataID] = i;
        } else if (
          isInformationFlowEPC(graphEntityDataType) ||
          isStandardEdgeBPMN(graphEntityDataType)
        ) {
          let opToOp = false;
          let operatorID = "";
          let graphEntityDataSource = graphEntityData[graphArtefacts.SOURCE];
          let graphEntityDataTarget = graphEntityData[graphArtefacts.TARGET];

          let operatorIDs = [];
          if (
            Object.keys(markedOperatorsIndexMap).includes(
              graphEntityDataSource
            ) &&
            Object.keys(markedOperatorsIndexMap).includes(graphEntityDataTarget)
          ) {
            operatorIDs.push(graphEntityDataSource);
            operatorIDs.push(graphEntityDataTarget);
            opToOp = true;
          } else if (
            Object.keys(markedOperatorsIndexMap).includes(graphEntityDataSource)
          ) {
            operatorIDs.push(graphEntityDataSource);
          } else if (
            Object.keys(markedOperatorsIndexMap).includes(graphEntityDataTarget)
          ) {
            operatorIDs.push(graphEntityDataTarget);
          }
          if (operatorIDs) {
            for (operatorID of operatorIDs) {
              let edgeElement = {
                edgeID: graphEntityDataID,
                edgeIndex: i,
                source: graphEntityDataSource,
                target: graphEntityDataTarget,
                opToOp: opToOp,
              };
              let operatorObject = {
                operatorIndex: markedOperatorsIndexMap[operatorID],
                operatorVariants: graphEntityData[graphArtefacts.VARIANTS],
                edgeArray: [edgeElement],
              };
              if (Object.keys(markedOperatorsMap).includes(operatorID)) {
                let operatorEdgeArray =
                  markedOperatorsMap[operatorID]["edgeArray"];
                operatorEdgeArray.push(edgeElement);
                operatorObject["edgeArray"] = operatorEdgeArray;
              }
              markedOperatorsMap[operatorID] = operatorObject;
            }
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
      if (graphEntityData.hasOwnProperty(graphArtefacts.TARGET)) {
        /** Is the element an edge */
        graphEntityData["sum"] = sum;
      } else {
        /** The element is a node  */
        newLine = "\n";
      }

      if (
        sum > biggestSum &&
        !isStartOrEndNode(graphEntityData[graphArtefacts.LABEL])
      ) {
        biggestSum = sum;
      }
      if (
        sum < smallestSum &&
        !isStartOrEndNode(graphEntityData[graphArtefacts.LABEL])
      ) {
        smallestSum = sum;
      }
      graphEntityData[graphArtefacts.LABEL] = `${
        graphEntityData[graphArtefacts.LABEL]
      }${newLine}${sum}`;
    } else {
      labelSequenceID(graphEntityData, variantsReq, sequenceReq);
    }
    if (nodeEnv === environment.PRODUCTION) {
      delete graphJSONconcrete[i][graphArtefacts.DATA][graphArtefacts.VARIANTS];
    }
  }

  /**
   * Check if the existing operators still need to be used or if they
   * can be deleted due to simple origin and destination edges.
   */
  let array = Object.entries(markedOperatorsMap);
  let substractIndex = 0;

  let counter3;
  for (counter3 = 0; counter3 < array.length; counter3++) {
    let operator = array[counter3][0];
    let edgeObject = array[counter3][1];
    let edgeArray = edgeObject["edgeArray"];

    if (edgeArray.length == 2) {
      let source = "";
      let target = "";
      let newEgdeID = "";
      let edgeElement;
      for (operatorEdgeIndex in edgeArray) {
        edgeElement = edgeArray[operatorEdgeIndex];
        if (edgeElement[graphArtefacts.SOURCE] == operator) {
          target = edgeElement[graphArtefacts.TARGET];
        } else if (edgeElement[graphArtefacts.TARGET] == operator) {
          source = edgeElement[graphArtefacts.SOURCE];
        }
        // Delete unused edges
        let febuob = graphJSONconcrete.findIndex(
          (y) => y.data.id === edgeElement["edgeID"]
        );
        graphJSONconcrete.splice(febuob, 1);
        substractIndex++;
      }

      let operatorProperties = graphJSONconcrete[edgeObject["operatorIndex"]];
      let operatorSum = parseInt(
        operatorProperties[graphArtefacts.DATA][graphArtefacts.LABEL].split(
          "\n"
        )[1]
      );
      // delete unused operator
      let febuob = graphJSONconcrete.findIndex((y) => y.data.id === operator);
      graphJSONconcrete.splice(febuob, 1);
      substractIndex++;
      newEgdeID = `${source}->${target}`;
      let newEdge = {};
      if (graphType == graphTypeEnum.EPC) {
        newEdge = {
          data: {
            id: newEgdeID,
            source: source,
            target: target,
            type: bpmnEnum.EDGE.INFORMATION_FLOW,
            sum: operatorSum,
            label: operatorSum,
            variants: edgeObject["operatorVariants"],
          },
        };
      } else if (graphType == graphTypeEnum.BPMN) {
        newEdge = {
          data: {
            id: newEgdeID,
            source: source,
            target: target,
            type: bpmnEnum.EDGE.STANDARD_EDGE,
            sum: operatorSum,
            label: operatorSum,
            variants: edgeObject["operatorVariants"],
          },
        };
      }

      graphJSONconcrete.push(newEdge);
      array.splice(counter3, 1);
      if (edgeElement["opToOp"]) {
        for (let ii = 0; ii < array.length; ii++) {
          let edgeArrayB = array[ii][1]['edgeArray']
          for(let jj = 0; jj < array.length; jj++){
            if(edgeArrayB[jj]['source'] === operator){
              array[ii][1]['edgeArray'][jj]['source'] = source;
              array[ii][1]['edgeArray'][jj]['edgeID'] = newEgdeID;

            }
          }
        }
      }

      
      for (let j = 0; j < array.length; j++) {
        // let operatorJ = array[j][0];
        let edgeObjectJ = array[j][1];
        let edgeArrayJ = edgeObjectJ["edgeArray"];
        for (let k = 0; k < edgeArrayJ.length; k++) {
          if (
            edgeArrayJ[k]["target"] == operator ||
            edgeArrayJ[k]["source"] == operator
          ) {
            let operatorID = edgeArrayJ[k]["edgeID"];
            edgeArrayJ.splice(k, 1);
            array[j][1]["edgeArray"] = edgeArrayJ;
            let febuob = graphJSONconcrete.findIndex(
              (y) => y.data.id === operatorID
            );
            graphJSONconcrete.splice(febuob, 1);
          }
        }
      }
      counter3 = -1;
    }
  }

  /**
   * Listing of the unneeded edges in the graph
   */
  let opToOpEdge = [];

  /**
   * Overwrite the origin nodes in the edges, depending on the deleted operators.
   */
  for (let i = 0; i < markedIndexSource.length; i++) {
    let target = markedIndexSource[i][graphArtefacts.TARGET];
    for (let j = 0; j < markedIndexTarget.length; j++) {
      let source = markedIndexTarget[j][graphArtefacts.SOURCE];
      if (source == target) {
        let index = markedIndexTarget[j]["i"];
        if (markedIndexTarget[j]["opToOp"]) {
          opToOpEdge.push(index);
          let sourceTemp = markedIndexTarget[j][graphArtefacts.TARGET];
          for (let k = 0; k < markedIndexTarget.length; k++) {
            let targetTemp = markedIndexTarget[k][graphArtefacts.SOURCE];
            if (sourceTemp == targetTemp) {
              target = sourceTemp;
              break;
            }
          }

          continue;
        }

        graphJSONconcrete[index][graphArtefacts.DATA][graphArtefacts.SOURCE] =
          markedIndexSource[i][graphArtefacts.SOURCE];
        break;
      }
    }
  }

  /**
   * Deleting unnecessary edges in the graph
   */
  for (edge of opToOpEdge) {
    graphJSONconcrete.splice(edge, 1);
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
  if (!type) {
    return false;
  }
  return Object.values(epcEnum.OPERATOR)
    .map(function (e) {
      return e.toLowerCase();
    })
    .includes(type.toLowerCase());
}

/**
 * Check if type is:
 * - "informationflow"
 * @param {string} type
 * @returns {boolean}
 */
function isInformationFlowEPC(type) {
  if (!type) {
    return false;
  }
  return type.toLowerCase() == epcEnum.EDGE.INFORMATION_FLOW.toLowerCase();
}

/**
 * Check if type is:
 * - "standardedge"
 * @param {string} type
 * @returns {boolean}
 */
function isStandardEdgeBPMN(type) {
  if (!type) {
    return false;
  }
  return type.toLowerCase() == bpmnEnum.EDGE.STANDARD_EDGE.toLowerCase();
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
  if (!type) {
    return false;
  }
  return Object.values(bpmnEnum.OPERATOR)
    .map(function (e) {
      return e.toLowerCase();
    })
    .includes(type.toLowerCase());
}

/**
 * Select the edgewidth on every edge in the graph
 * @param {Object} graphJSONconcrete
 * @param {Array} spacingWidthArray
 */
function setGraphEdgeWidth(graphJSONconcrete, spacingWidthArray) {
  for (var i = 0; i < graphJSONconcrete.length; i++) {
    let graphData = graphJSONconcrete[i][graphArtefacts.DATA];
    if (graphData.hasOwnProperty(graphArtefacts.TARGET)) {
      /** Is edge */
      for (value of spacingWidthArray) {
        if (graphData["sum"] <= parseInt(value)) {
          /** check if sum of element is smaller or equal of given sum values */
          graphData["width"] =
            spacingWidthArray.indexOf(value) +
            1; /** add index of value as edgewidth to element */
          if (nodeEnv === environment.PRODUCTION) {
            delete graphJSONconcrete[i][graphArtefacts.DATA]["sum"];
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
  graphDataLabel = graphData[graphArtefacts.LABEL];
  if (graphDataLabel != "" && !isStartOrEndNode(graphDataLabel)) {
    graphData[graphArtefacts.LABEL] = `${graphDataLabel}\n${
      graphData[graphArtefacts.VARIANTS][variant][sequenceReq]
    }`;
  }
}

function getVariantsFromNodes(graphJSON, graphType, nodes){
  let nodesToDelete = 1 - nodes;
  let frequencyMap = {};
  let deleteCount = 0;
  let values = [];
  let variants =
  graphJSON[graphType][graphArtefacts.GRAPH][0][graphArtefacts.DATA][
        graphArtefacts.VARIANTS
      ];
  variantsCount = Object.keys(variants).length;
  frequencyMap = getFrequencyMap(variants);
  frequencyMap = jsonUtils.sortMapByValue(frequencyMap);
  
  if(nodesToDelete <= 0){
    nodesToDelete = 0.01
  }else if(nodesToDelete > 1){
    nodesToDelete = 1
  }
  deleteCount = Math.ceil(nodesToDelete * variantsCount) - 1;
  variants = Object.keys(frequencyMap);
  variants.splice((variantsCount - deleteCount), deleteCount);
  return variants;
}

module.exports = filterGraph;
