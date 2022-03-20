/**
 * @file Converts epc graph json object to epml-Format
 * @author HARCIS-DEV TEAM
 */

const logger = require('../../log/log.js');

/**
 * Converts `epc graph json object` to `epml`-Format
 * @param {number | string} _id SAP-ID
 * @param {number | string} name name of epc graph
 * @param {object} epc epc json object
 * @returns {string} epml - string
 */
function convertJsonToEpml(_id, name, epc) {
    logger.debug(`convert json to epml`);
    let epmlDefinitionsString = `<definitions> <definition xmlns:addon="http://org.bflow.addon" defId="${_id}"/>`;
    let epmlDirectoryString = `<directory name="Root"> <epc epcId="${_id}" name="${name}" IdBflow="1">`;

    for (var i = 0; i < epc.length; i++) {

        let graphData = epc[i]["data"];
        let hasVariants = graphData.hasOwnProperty("variants");
        let variants = {};
        if (hasVariants) {
            variants = JSON.stringify(graphData["variants"]).replace(/\"/g, "'");
        }

        if (!graphData.hasOwnProperty("target")) {
            /** Is node */
            let id = graphData["id"];
            let type = graphData["type"].toLowerCase();
            let label = graphData["label"].split("\n");
            epmlDirectoryString += `<${type} id="${id}" IdBflow="${i + 2}" defRef="${i + 3}">`;
            if (type != "and" && type != "or" && type != "xor") {
                epmlDefinitionsString += `<definition xmlns:addon="http://org.bflow.addon" defId="${id}"/>`;
                epmlDirectoryString += `<name xmlns:addon="http://org.bflow.addon">${label}</name>`;
            }
            if (hasVariants) {
                epmlDirectoryString += `<attribute typeRef ="variants" value ="${variants}"/>`;
            }

            epmlDirectoryString += `</${type}>`

        } else {
            /** Is edge */
            let source = graphData["source"];
            let target = graphData["target"];
            epmlDirectoryString += `<arc id="${i + 2}" IdBflow="${i + 2}">
                                <flow source="${source}" target="${target}"/>`;
            if (hasVariants) {
                epmlDirectoryString += `<attribute typeRef ="variants" value ="${variants}"/>`;
            }
            epmlDirectoryString += `</arc>`;
        }
    }
    epmlDefinitionsString += `</definitions>`;
    return epmlHead + epmlDefinitionsString + epmlDirectoryString + epmlFoot;
}

const epmlHead = `<?xml version="1.0" encoding="UTF-8"?>
            <epml:epml xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:epc="org.bflow.toolbox.epc"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:notation="http://www.eclipse.org/gmf/runtime/1.0.1/notation"
            xmlns:epml="http://www.epml.de"
            xmlns:xmi="http://www.omg.org/XMI">
            <coordinates xOrigin="leftToRight" yOrigin="topToBottom"/>`

const epmlFoot = `</epc> </directory> </epml:epml>`

module.exports = convertJsonToEpml;