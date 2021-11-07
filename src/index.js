/**
 * @file API - main and route 
 */

const express = require('express');
const app = express();

require('dotenv').config({path: require('find-config')(`.env`)})

const mongoClient = require('mongodb').MongoClient;
const mongodbHost = process.env.MONGODB_DOMAIN || "127.0.0.1";
const mongodbPort = process.env.MONGODB_PORT || "27017";
const mongodbUrl = `mongodb://${mongodbHost}:${mongodbPort}/`;
// ${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@
const mongodbName = 'graph';
const mongodbCollection = 'graph';
const bodyParser = require('body-parser');
const jsonParser = require("./utils/json/jsonParser.js")
const filterVariants = require("./utils/variants/filterVariants.js")
const convertDFG2Graphml = require("./utils/convert/dfgToGraphml.js")
const nodeEnv = process.env.NODE_ENV || 'development';
const serverPort = process.env.SERVER_PORT || 8080;
var logger = require('./utils/log/log.js'); 
logger.info(`Service started in ${nodeEnv}-Mode on Port ${serverPort}`);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.listen(serverPort, () => {
    mongoClient.connect(mongodbUrl, {useNewUrlParser: true}, (error, client) => {
        if (error) {
            logger.error(`${error}`);
            throw error;
        }
        database = client.db(mongodbName);
        collection = database.collection(mongodbCollection);
        logger.info(`Connected to Database: ${mongodbName}. Collection: ${mongodbCollection}.`);
    });
});
/**
 * Request for an graph with the given ID in MongoDB
 * Filter with the parameter in body:
 * - variants
 * - sequence
 */
app.post("/graph/variants", (request, response) => {
    let query = {"_id": `${request.query.id}`}
    collection.findOne(query,(error, result) => {
        let variants = [];
        let sequence = "";
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        /** @param {Array} variants - Filter with variants */
        if("variants" in request.body){
            variants = request.body.variants;
        }
        /** @param {String} sequence - Filter with sequence */
        if("sequence" in request.body){
            sequence = request.body.sequence;
        }
        logger.debug(`findOne: ${result}`);    
        try{
            response.send(filterVariants(result, variants, sequence));
        }catch(error){
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }
        
    });
});

/**
 * Insert graph with @param {String} _id if not exist, Replace graph if @param {String} _id exist
 * return Response with accpeted or failed answer
 */
app.post("/graph", (request, response) => {
    collection.replaceOne({"_id": `${jsonParser(request.body, "_id")}`}, request.body,{upsert: true}, (error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`replaceOne: ${result}`);
        response.send(result);
    });
});

/**
 * Get all availibe ids from all graphs in database
 */
app.get("/ids", (request, response) => {
    collection.distinct( '_id',(error, result) => {
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        logger.debug(`find: ${result}`);
        response.send(result);
    });
});

app.post("/graph/download", (request, response) => {
    let query = {"_id": `${request.query.id}`}
    collection.findOne(query,(error, result) => {
        let variants = [];
        let sequence = "";
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        /** @param {Array} variants - Filter with variants */
        if("variants" in request.body){
            variants = request.body.variants;
        }
        logger.debug(`findOne: ${result}`);    
        try{
            let graphId = result["_id"]
            result = filterVariants(result, variants, "")
            let dfg = result["dfg"]["graph"]
            response.send(convertDFG2Graphml(graphId, dfg));
        }catch(error){
            logger.error(`${error}`);
            return response.status(500).send(`${error}`);
        }
        
    });
});