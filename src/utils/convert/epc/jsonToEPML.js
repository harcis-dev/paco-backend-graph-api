const logger = require('../../log/log.js');


function convertJsonToEpml(_id, name, epc){
    logger.debug(`convert json to epml`);
    let epmlString = ``;
    let epmlDefinitionsString = `<definitions> <definition xmlns:addon="http://org.bflow.addon" defId="1"/>`;
    let epmlDirectoryString = `<directory name="Root"> <epc epcId="1" name="${name}" IdBflow="1">`;

    for (var i = 0; i < dfg.length; i++) {
        
        
        let graphData = dfg[i]["data"];

        if (!graphData.hasOwnProperty("target")){   /** Is node */
            let type = graphData["type"];
            type = type.toLowerCase();
            if(type != "and" || type != "or" || type != "xor"){
                epmlDefinitionsString = `<definition xmlns:addon="http://org.bflow.addon" defId="${i+2}"/>`;
            }    
            let id = graphData["id"];
            
            let label = graphData["label"].split("\n");;            
            epmlDirectoryString += `<${type} id="${i+2}" IdBflow="${i+2}" defRef="${i+3}">
                                        <name xmlns:addon="http://org.bflow.addon">${label}</name>
                                        </${type}>`
        }else{                                      /** Is edge */
            let source = graphData["source"];
            let target = graphData["target"];
            epmlString += `<arc id="${i+2}" IdBflow="${i+2}">
                            <flow source="${source}" target="${target}"/>
                            </arc>`
/*             if (hasVariants){
                epmlString += `<data key="variants">${variants}</data>\n`
            } */
        }
    }
    epmlDefinitionsString = `</definitions>`;
    return epmlString
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
