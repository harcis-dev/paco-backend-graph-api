/**
 * @file Filter MongoDB Result for graph meta data
 * @author HARCIS-DEV TEAM
 */

const globalParameter = require("../../global/global.js");
const graphTypeEnum = globalParameter.graphTypeEnum;
const graphArtefacts = globalParameter.graphArtefacts;

/**
 * Selecting id, name, count of variants and types of graphs of a graph
 * @param {object} graphList - All objects from database
 * @returns {Array} graph meta data
 */
function getIdVariantCounts(graphList) {
  let idVariantsCount = [];
  for (let currentGraph of graphList) {
    let id = currentGraph["_id"];
    let name = currentGraph["name"];
    let graphTemp = 0;
    let variantsCount = 0;
    let graphTypes = [];

    for (let graphType in graphTypeEnum) {
      graphType = graphTypeEnum[graphType];
      if (currentGraph.hasOwnProperty(graphType)) {
        if (!graphTemp) {
          graphTemp = currentGraph[graphType];
        }
        graphTypes.push(graphType);
      }
    }

    if (graphTemp != 0) {
      if (
        graphTemp[graphArtefacts.GRAPH][0][graphArtefacts.DATA].hasOwnProperty(
          graphArtefacts.VARIANTS
        )
      ) {
        let variants =
          graphTemp[graphArtefacts.GRAPH][0][graphArtefacts.DATA][
            graphArtefacts.VARIANTS
          ];
        variantsCount = Object.keys(variants).length;
      }
      idVariantsCount.push({
        _id: id,
        name: name,
        variantsCount: variantsCount,
        graphTypes: graphTypes,
      });
    } else {
      idVariantsCount.push({
        _id: "-1",
        name: "Graph does not exist",
        variantsCount: -1,
      });
    }
  }
  return idVariantsCount;
}

module.exports = getIdVariantCounts;
