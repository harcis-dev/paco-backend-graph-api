/**
 * @file Global definitions
 * @author HARCIS-DEV TEAM
 */

const environment = Object.freeze({
  PRODUCTION: "production",
});

const graphTypeEnum = Object.freeze({
  DFG: "dfg",
  EPC: "epc",
  BPMN: "bpmn",
});

const dfgEnum = Object.freeze({
  NODE: "node",
  DIRECTED_EDGE: "DirectedEdge",
});

const epcNodeEnum = Object.freeze({
  FUNCTION: "Function",
  INTERFACE: "Interface",
  EVENT: "Event",
  APPLICATION: "Application",
  TECHNICAL_TERM: "Technicalterm",
  PARTICIPANT: "Participant",
  GROUP: "Group",
  LOCATION: "Location",
  POSITION: "Position",
  FILE: "File",
  DOCUMENT: "Document",
  CARDFILE: "Cardfile",
  CLUSTER: "Cluster",
  INTERNAL_PERSON: "InternalPerson",
  EXTERNAL_PERSON: "ExternalPerson",
  PRODUCT: "Product",
  OBJECTIVE: "Objective",
  PERSON_TYPE: "PersonType",
});

const epcOperatorEnum = Object.freeze({
  XOR: "XOR",
  OR: "OR",
  AND: "AND",
});

const epcEdgeEnum = Object.freeze({
  INFORMATION_FLOW: "InformationFlow",
  CONTROL_FLOW: "ControlFlow",
});

const epcEnum = Object.freeze({
  NODE: epcNodeEnum,
  OPERATOR: epcOperatorEnum,
  EDGE: epcEdgeEnum,
});

const bpmnNodeEnum = Object.freeze({
  NONE_START: "NoneStart",
  INTERMEDIATE: "Intermediate",
  END: "End",
  GENERIC_TASK: "GenericTask",
});

const bpmnOperatorEnum = Object.freeze({
  EXCLUSIVE: "Exclusive",
  INCLUSIVE: "Inclusive",
  PARALLEL: "Parallel",
});

const bpmnEdgeEnum = Object.freeze({
  STANDARD_EDGE: "StandardEdge",
});

const bpmnEnum = Object.freeze({
  NODE: bpmnNodeEnum,
  OPERATOR: bpmnOperatorEnum,
  EDGE: bpmnEdgeEnum,
});

const graphArtefacts = Object.freeze({
  GRAPH: "graph",
  DATA: "data",
  ID: "id",
  LABEL: "label",
  TYPE: "type",
  VARIANTS: "variants",
  SOURCE: "source",
  TARGET: "target",
  LABEL: "label",
});

module.exports = {
  environment,
  graphTypeEnum,
  dfgEnum,
  epcEnum,
  bpmnEnum,
  graphArtefacts,
};
