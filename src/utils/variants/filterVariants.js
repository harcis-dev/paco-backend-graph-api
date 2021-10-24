const isEmptyObject = require("../json/jsonEmpty.js")

function filterVariants(graphJSON, variants) {
    if (isEmptyObject(variants)) {
        filterVariantsConrete(graphJSON.dfg, variants);
        filterVariantsConrete(graphJSON.epc, variants);
        filterVariantsConrete(graphJSON.bpmn, variants);
    }
    return graphJSON
}

function arrayEquals(target, variants) {
    return target.some(v => variants.includes(v));
}
function filterVariantsConrete(graphJSONconcrete, variants) {
    for (var i = 0; i < graphJSONconcrete.length; i++) {
        if (!(arrayEquals(graphJSONconcrete[i].data.variants, variants))) {
            graphJSONconcrete.splice(i, 1);
            i--;
        }
        //delete graphJSONconcrete[i].data.variants
    }
}


module.exports = filterVariants;