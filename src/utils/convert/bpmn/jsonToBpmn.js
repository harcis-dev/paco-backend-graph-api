/**
 * @file Converts bpmn json to bpmn
 * @author HARCIS-DEV TEAM
 */

const { bpmnEnum } = require("../../../global/global.js");
const logger = require("../../log/log.js");

/**
 * Convert bpmn Object to bpmn
 * @param {Number} _id SAP-ID
 * @param {Object} bpmn bpmn-graph
 * @returns {String} Contains bpmn in bpmn format
 */
function convertBpmnJson2Bpmn(_id, bpmn) {
  logger.debug(`convert BPMN JSON to BPMN`);
  let xmlString = xmlHead;
  let processRef = bpmn["_id"];
  let graphArray = bpmn["bpmn"]["graph"];
  let processString = ` <bpmn:process id="Process_${processRef}" isExecutable="true">`;
  let nodeArray = [];
  let edgeArray = [];
  let parentFlag = false;

  // Iterate trough graphArray and filter for nodes and edges
  for (graphElement of graphArray) {
    let elementData = graphElement["data"];
    if ("type" in elementData) {
      switch (elementData["type"]) {
        case bpmnEnum.EDGE.STANDARD_EDGE:
          edgeArray.push(graphElement["data"]);
          break;
        case bpmnEnum.NODE.INTERMEDIATE:
          nodeArray.push(graphElement["data"]);
          break;
        case bpmnEnum.NODE.END:
          nodeArray.push(graphElement["data"]);
          break;
        case bpmnEnum.NODE.GENERIC_TASK:
          nodeArray.push(graphElement["data"]);
          break;
        case bpmnEnum.OPERATOR.EXCLUSIVE:
          nodeArray.push(graphElement["data"]);
          break;
      }
    } else {
      parentFlag = true;
      // graph contains a pool
      xmlString += `<bpmn:collaboration id="Collaboration_${processRef}">
                        <bpmn:participant id="Participant_${processRef}" processRef="Process_${processRef}"/>
                        </bpmn:collaboration>`;
    }
  }

  processString += createBpmnArtefacts(nodeArray, edgeArray);
  processString += "</bpmn:process>";
  xmlString += processString;
  // <bpmndi:BPMNDiagram id="BPMNDiagram_1">
  // <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1cuctwg">
  xmlString += `<bpmndi:BPMNDiagram id="BPMNDiagram_${processRef}">
                        <bpmndi:BPMNPlane id="BPMNPlane_${processRef}" bpmnElement="Collaboration_${processRef}">`;
  xmlString += createBpmnArtefactsShapes(edgeArray, nodeArray, processRef, parentFlag);
  xmlString += `</bpmn:definitions>`;

  return xmlString;
}

/**
 * get bounds for bmpn element
 * 
 * @param {String} type bpmn type
 * @returns 
 */
function getBounds(type) {
  switch (type) {
    case bpmnEnum.NODE.GENERIC_TASK:
      return `<dc:Bounds width="100" height="80"/>`;
    case bpmnEnum.NODE.INTERMEDIATE:
      return `<dc:Bounds width="36" height="36"/>`;
    case bpmnEnum.NODE.END:
      return `<dc:Bounds width="36" height="36"/>`;
    case bpmnEnum.OPERATOR.EXCLUSIVE:
      return `<dc:Bounds width="50" height="50"/>`;
  }
}

/**
 * Choose type of bpmn artefact for xml
 * 
 * @param {String} type bpmn type
 * @returns {String} bpmn xml type
 */
function getBpmnXmlType(type) {
  switch (type) {
    case bpmnEnum.NODE.GENERIC_TASK:
      return `task`;
    case bpmnEnum.NODE.INTERMEDIATE:
      return `startEvent`;
    case bpmnEnum.NODE.END:
      return `endEvent`;
    case bpmnEnum.OPERATOR.EXCLUSIVE:
      return `exclusiveGateway`;
  }
}
/**
 * Create shapes for bpmn graph
 * 
 * @param {Array} edgeArray 
 * @param {Array} nodeArray 
 * @param {String} processRef 
 * @param {Boolean} parentFlag 
 * @returns {String} diagramString
 */
function createBpmnArtefactsShapes(edgeArray, nodeArray, processRef, parentFlag){
      /*
        <bpmndi:BPMNShape id="Participant_0o6u1ge_di" bpmnElement="Participant_0o6u1ge" isHorizontal="true">
            <dc:Bounds width="1540" height="500"/>
        </bpmndi:BPMNShape>
    */
    let diagramString = "";
    if (parentFlag) {
        diagramString = `<bpmndi:BPMNShape id="Participant_${processRef}_di" bpmnElement="Participant_${processRef}" isHorizontal="true">
                                <dc:Bounds width="1540" height="500"/>
                                </bpmndi:BPMNShape>`;
      }
    
      for (edgeElement of edgeArray) {
        let edgeElementId = edgeElement["id"];
        diagramString += `<bpmndi:BPMNEdge id="${edgeElementId}_di" bpmnElement="${edgeElementId}">
            </bpmndi:BPMNEdge>`;
      }
    
      for (nodeElement of nodeArray) {
        let nodeElementId = nodeElement["id"];
        diagramString += `<bpmndi:BPMNShape id="${nodeElementId}_di" bpmnElement="${nodeElementId}">
                                ${getBounds(nodeElement["type"])}
                                </bpmndi:BPMNShape>`;
      }
      diagramString += `</bpmndi:BPMNPlane>
                            </bpmndi:BPMNDiagram>`;
      return diagramString;
}

/**
 * Iterate trough both arrays and create string for
 * nodes and edges
 * 
 * @param {Array} nodeArray 
 * @param {Array} edgeArray 
 * @returns {String} 
 */
function createBpmnArtefacts(nodeArray, edgeArray) {
  let processString = "";
  /*
        <bpmn:task id="A_erstellen" name="A erstellen">
        <bpmn:incoming>Edge_Start_A</bpmn:incoming>
        <bpmn:outgoing>Edge_A_XOR1</bpmn:outgoing>
        </bpmn:task>
    */
  for (nodeElement of nodeArray) {
    let id = nodeElement["id"];
    let label = nodeElement["label"];
    let type = nodeElement["type"];
    let bpmnType = getBpmnXmlType(type);
    let elementString = "";

    if (
      type == bpmnEnum.NODE.INTERMEDIATE ||
      type == bpmnEnum.NODE.END ||
      type == bpmnEnum.OPERATOR.EXCLUSIVE
    ) {
      elementString += `<bpmn:${bpmnType} id="${id}">`;
    } else {
      elementString += `<bpmn:${bpmnType} id="${id}" name="${label}">`;
    }
    if ("variants" in nodeElement) {
      let variantsObject = {};
      let variants = nodeElement["variants"];
      variantsObject["variants"] = variants;
      elementString +=
        "<bpmn:documentation>" +
        JSON.stringify(variantsObject) +
        "</bpmn:documentation>";
    }
    for (edgeElement of edgeArray) {
      if (edgeElement["source"] == id) {
        elementString += `<bpmn:outgoing>${edgeElement["id"]}</bpmn:outgoing>`;
      }
      if (edgeElement["target"] == id) {
        elementString += `<bpmn:incoming>${edgeElement["id"]}</bpmn:incoming>`;
      }
    }
    elementString += `</bpmn:${bpmnType}>`;
    processString += elementString;
  }
  // <bpmn:sequenceFlow id="Edge_Start_A" sourceRef="Start" targetRef="A_erstellen"/>
  for (edgeElement of edgeArray) {
    let id = edgeElement["id"];
    let source = edgeElement["source"];
    let target = edgeElement["target"];
    if ("variants" in nodeElement) {
      let variantsObject = {};
      let variants = edgeElement["variants"];
      variantsObject["variants"] = variants;
      processString += `<bpmn:sequenceFlow id="${id}" sourceRef="${source}" targetRef="${target}"><bpmn:documentation>${JSON.stringify(
        variantsObject
      )}</bpmn:documentation></bpmn:sequenceFlow>`;
    } else {
      processString += `<bpmn:sequenceFlow id="${id}" sourceRef="${source}" targetRef="${target}"/>`;
    }
  }

  return processString;
}

/**
 * default bpmn xml header
 */
const xmlHead = `<?xml version="1.0" encoding="UTF-8"?>
                    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                    xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                    xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                    id="Definitions_1" 
                    targetNamespace="http://bpmn.io/schema/bpmn">`;

module.exports = convertBpmnJson2Bpmn;
