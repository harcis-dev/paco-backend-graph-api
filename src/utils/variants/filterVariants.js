const isEmptyObject = require("../json/jsonEmpty.js")

function filterVariants(graphJSON, variants) {
    filterVariantsConrete(graphJSON.dfg.graph, variants);
    //filterVariantsConrete(graphJSON.epc.graph, variants);
    //filterVariantsConrete(graphJSON.bpmn.graph, variants);

    return graphJSON
}

function arrayEquals(target, variants) {
    return target.some(v => variants.includes(v));
}

function filterVariantsConrete(graphJSONconcrete, variants) {
    let isVariantsEmpty = isEmptyObject(variants);
    let frequencyMap = getFrequencyMap(graphJSONconcrete[0]["data"]["variants"])
    for (var i = 0; i < graphJSONconcrete.length; i++) {
        let sum = 0;
        let graphData = graphJSONconcrete[i].data
        let graphVariants = Object.keys(graphData.variants);
        if (!(arrayEquals(graphVariants, variants)) && !isVariantsEmpty) {
            graphJSONconcrete.splice(i, 1);
            i--;
            continue;
        }
        for (const [key, value] of Object.entries(frequencyMap)) {
            if (graphVariants.includes(key) && (variants.includes(key) || isVariantsEmpty)) {
                sum += value;
            }

    }
        graphData.label = `${graphData.label} / ${sum}`
        //delete graphJSONconcrete[i]["data"]["variants"]// Add this in Production Mode
    }
}

function getFrequencyMap(variants) {
    let keys = Object.keys(variants);
    let frequencyMap = {};
    keys.forEach(function (key) {
        frequencyMap[key] = Object.keys(variants[key]).length;
    });
    return frequencyMap;
}

module.exports = filterVariants;