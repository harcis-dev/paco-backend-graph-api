const isEmptyObject = require("../json/jsonEmpty.js")

function filterVariants(graphJSON, variants) {
    let isVariantsEmpty = isEmptyObject(variants);
    filterVariantsConrete(graphJSON.dfg.graph, graphJSON.dfg.frequency, variants, isVariantsEmpty);
    filterVariantsConrete(graphJSON.epc.graph, graphJSON.dfg.frequency, variants, isVariantsEmpty);
    filterVariantsConrete(graphJSON.bpmn.graph, graphJSON.dfg.frequency, variants, isVariantsEmpty);

    return graphJSON
}

function arrayEquals(target, variants) {
    return target.some(v => variants.includes(v));
}

function filterVariantsConrete(graphJSONconcrete, frequency, variants, isVariantsEmpty) {
    for (var i = 0; i < graphJSONconcrete.length; i++) {
        let sum = 0;
        let graphData = graphJSONconcrete[i].data
        let graphVariants = graphData.variants;
        if (!(arrayEquals(graphVariants, variants)) && !isVariantsEmpty) {
            graphJSONconcrete.splice(i, 1);
            i--;
            continue;
        }
        for (const [key, value] of Object.entries(frequency)) {
            if (variants.includes(key)) {
                sum += value;
            }
        }
        graphData.label = `${graphData.label} \n ${sum}`
        //delete graphVariants
    }
}

module.exports = filterVariants;