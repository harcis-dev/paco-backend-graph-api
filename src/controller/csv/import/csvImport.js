/**
 * @file // TODO
 * @author HARCIS-DEV TEAM
 */

const jsonUtils = require("../../../utils/jsonUtils.js");
const logger = require('../../../utils/log/log.js');

// Database
const mongodb = require('../../../database/mongodb.js')
const fs = require('fs');

/**
 * // TODO
 * 
 * https://medium.com/@svibhuti22/file-upload-with-multer-in-node-js-and-express-5bc76073419f
 */
function csvImport(request, response) {

    var file_path = request.file.path;

    if (!(Object.prototype.hasOwnProperty.call(request, 'file'))) {
        fs.unlinkSync(file_path);
        return response.status(400).send("Error: Requestbody must contain file");
    }

    object = {
        "name": `${request["body"]['name']}`,
        "path": `${file_path}`
    }

    const data = fs.readFileSync(file_path, 'UTF-8');    
    const rows = data.split('\n');

    let headerColumns = rows[0].split(',');
    for (let i = 0; i < headerColumns.length; i++) {
        headerColumns[i] = headerColumns[i].replace(/[^a-zA-Z0-9]/g, '');
    }

    if(!headerColumns.includes('caseid')){
        let errorMessage = 'Table need "case id" column';
        fs.unlinkSync(file_path);
        logger.error(errorMessage);
        return response.status(500).send(errorMessage);
    }

    let caseIndex = headerColumns.indexOf('caseid');

    let columns = rows[1].split(',');
    let caseID = columns[caseIndex];
    if(!caseID.match(/^[0-9]+_[0-9]+$/)){
        let errorMessage = `"case id" does not match pattern "^[0-9]+_[0-9]+$": ${caseID}`;
        fs.unlinkSync(file_path);
        logger.error(errorMessage);
        return response.status(500).send(errorMessage);
    }

    if(!headerColumns.includes('activity')){
        let errorMessage = 'Table needs "activity" column';
        fs.unlinkSync(file_path);
        logger.error(errorMessage);
        return response.status(500).send(errorMessage);
    }

    if(!headerColumns.includes('timestamp')){
        let errorMessage = 'Table needs "timestamp" column';
        fs.unlinkSync(file_path);
        logger.error(errorMessage);
        return response.status(500).send(errorMessage);
    }

    let timestampIndex = headerColumns.indexOf('timestamp');

    let timestamp = columns[timestampIndex];
    if(!(new Date(timestamp)).getTime() > 0){
        let errorMessage = `timestamp not valid: ${timestamp}`;
        fs.unlinkSync(file_path);
        logger.error(errorMessage);
        return response.status(500).send(errorMessage);
    }

    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbCsvCollection).insertOne(object, (error, result) => {
        if (error) {
            fs.unlinkSync(file_path);
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
}



module.exports = csvImport;