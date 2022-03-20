/**
 * @file Converts graphml to json format
 * @author HARCIS-DEV TEAM
 */

 const parser = require('xml2json');
 const globalParameter = require("../../../global/global.js");

 const graphTypeEnum = globalParameter.graphTypeEnum;
 const bpmnEnum = globalParameter.bpmnEnum;
 const graphArtefacts = globalParameter.graphArtefacts;
 /**
  * Convert the given xml-String to an graph object 
  * @param {String} dfgXML 
  * @returns {Object} 
  */
 function convertBpmn2Json(dfgXML) {
     let graphXml = dfgXML.replace("\$", "\"");
     let graphJson = JSON.parse(parser.toJson(graphXml));
     let graphData = graphJson['bpmn:definitions'];
     let parent = "";
     let graphDataArray = [];
     if ('bpmn:collaboration' in graphData){
        let process = graphData['bpmn:collaboration'];
        let processName = process['id'];
        graphDataArray.push(pushProcess(processName));
        parent = processName;
        
     }
     if ('bpmn:process' in graphData){
         let graphDataProcess = graphData['bpmn:process'];
         
         // Put start into graph
         if('bpmn:startEvent' in graphDataProcess){
            let variants = "";
            graphDataArray.push(pushGraphNode('Start', bpmnEnum.NODE.INTERMEDIATE, parent, "", variants));    
         }

         // put tasks into graph
         if('bpmn:task' in graphDataProcess){
            let taskArray = graphData['bpmn:process']['bpmn:task'];
            for(graphTaskData of taskArray){
                let id = graphTaskData['id'];
                let name = graphTaskData['name'];
                let variants = "";
                graphDataArray.push(pushGraphNode(id, bpmnEnum.NODE.GENERIC_TASK, parent, name, variants));
            }
         }

        // put exlusive gateways into graph
        if('bpmn:exclusiveGateway' in graphDataProcess){
            let exclusiveGatewayArray = graphData['bpmn:process']['bpmn:exclusiveGateway'];
            for(graphXorData of exclusiveGatewayArray){
                let id = graphXorData['id'];
                let variants = "";
                graphDataArray.push(pushGraphNode(id, bpmnEnum.OPERATOR.EXCLUSIVE, parent, "", variants));
            }
        }

        if('bpmn:endEvent' in graphDataProcess){
            let variants = "";
            graphDataArray.push(pushGraphNode('Ende', bpmnEnum.NODE.END, parent, "", variants));    
         }

                 // put exlusive gateways into graph
        if('bpmn:sequenceFlow' in graphDataProcess){
            let edgeArray = graphData['bpmn:process']['bpmn:sequenceFlow'];
            for(edgeData of edgeArray){
                
                let source = edgeData['sourceRef'];
                let target = edgeData['targetRef'];
                let id = source + "->" + target;
                let variants = "";
                graphDataArray.push(pushGraphEdge(id, bpmnEnum.EDGE.STANDARD_EDGE, source, target, variants));
            }
        }

     }

     return {
        "graph": graphDataArray
    };

}

function pushProcess(process){
    return {'data':{'id': process, 'label': process }}
}

function pushGraphNode(id, type, parent, label = false, variants = false){
    let graphObject = {'id': id, 'type': type };
    if(parent){
        graphObject['parent'] = parent;
    }
    if(label){
        graphObject['label'] = label;
    }
    if(variants){
        graphObject['variants'] = variants;
    }
    return {'data':graphObject};
}

function pushGraphEdge(id, type, source, target, variants = false){
    let graphObject = {'id': id, 'source': source, 'target': target, 'type': type };
    if(variants){
        graphObject['variants'] = variants;
    }
    return {'data':graphObject};;
}

module.exports = convertBpmn2Json;