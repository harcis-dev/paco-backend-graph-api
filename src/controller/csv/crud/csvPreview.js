/**
 * @file Show preview of csv table
 * @author HARCIS-DEV TEAM
 */

 const jsonUtils = require("../../../utils/jsonUtils.js");
 const logger = require('../../../utils/log/log.js');
 
 // Database
 const mongodb = require('../../../database/mongodb.js')
 const fs = require('fs')
 const mongoose = require('mongoose');
 
/**
 * Show preview of csv table
 * @return
 */
 function csvPreview(request, response) {
   
    let query = {
        "_id": mongoose.Types.ObjectId(request["params"]["_id"])
    }
    let database = mongodb.getDatabase();
    database.collection(mongodb.mongodbCsvCollection).findOne(query, (error, result) => {
        if (typeof result == 'undefined' || result == null || result["matchedCount"] == 0) {
            return response.status(400).send("Error: No graph in database with provided _id");
        }
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`csv - findOne: ${result}`);
        try {

            resultString = "";

            const data = fs.readFileSync(result.path, 'UTF-8');
        
            const lines = data.split('\n');

            const rowCount = lines.length;

            var rowCounter = 100;

            if(rowCount < rowCounter){
                rowCounter = rowCount;
            }
        
            for(i = 0; i < rowCounter; i++){
                resultString += lines[i] + "\n";
            }

            return response.status(200).send(resultString);

        } catch (error) {
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }

    });

}

module.exports = csvPreview;