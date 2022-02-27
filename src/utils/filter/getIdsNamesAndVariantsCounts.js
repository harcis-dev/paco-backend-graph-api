/**
 * @file Filter MongoDB Result for graph meta data
 * @author HARCIS-DEV TEAM
 */

const graphTypeEnum = require("../../global/global.js");

/**
 * Selecting id, name, count of variants and types of graphs of a graph
 * @param {object} result - All objects from database
 * @returns {Array} graph meta data
 */
function getIdsNamesAndVariantCounts(result) {
  let idVariantsCount = [];
  for (let graphs of result) {
    let id = graphs["_id"];
    let name = graphs["name"];
    let graph = 0;
    let variantsCount = 0;
    let graphTypes = [];

    for (let graphType in graphTypeEnum) {
      graphType = graphTypeEnum[graphType];
      if (graphs.hasOwnProperty(graphType)) {
        if (!graph) {
          graph = graphs[graphType];
        }
        graphTypes.push(graphType);
      }
    }

    if (graph != 0) {
      if (graph["graph"][0]["data"].hasOwnProperty("variants")) {
        let variants = graph["graph"][0]["data"]["variants"];
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

module.exports = getIdsNamesAndVariantCounts;
