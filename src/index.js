const express = require('express');
const app = express();

require('dotenv').config({path: require('find-config')(`.env`)})

const mongoClient = require('mongodb').MongoClient;
const mongodbHost = process.env.MONGODB_DOMAIN || "127.0.0.1";
const mongodbPort = process.env.MONGODB_PORT || "27017";
const mongodbUrl = `mongodb://${mongodbHost}:${mongodbPort}/`;
// ${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@
const mongodbName = 'graph';

const bodyParser = require('body-parser');
const jsonParser = require("./utils/json/jsonParser.js")
const filterVariants = require("./utils/variants/filterVariants.js")

const nodeEnv = process.env.NODE_ENV || 'development';

const winston = require('winston');
const logsDir = './logs/';
const logger = winston.createLogger({
    level: nodeEnv === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'graph-api' },
    transports: [
        new winston.transports.File({ filename: `${logsDir}error.log`, level: 'error' }),
        new winston.transports.File({ filename: `${logsDir}combined.log` }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    ],
});

logger.info(`Service started in ${nodeEnv}-Mode`);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.listen(process.env.SERVER_PORT, () => {
    mongoClient.connect(mongodbUrl, {useNewUrlParser: true}, (error, client) => {
        if (error) {
            logger.error(`${error}`);
            throw error;
        }
        database = client.db(mongodbName);
        collection = database.collection(mongodbName);
        logger.info(`Connected to Database: ${mongodbName}.`);
    });
});
//Get graph, filter with variants in request body
app.post("/graph/variants", (request, response) => {
    let query = {"_id": `${request.query.id}`}
    collection.findOne(query,(error, result) => {
        let variants = [];
        let sequence = "";
        if (error) {
            logger.error(`${error}`);
            return response.status(500).send(error);
        }
        if("variants" in request.body){
            variants = request.body.variants;
        }
        if("sequence" in request.body){
            sequence = request.body.sequence;
        }
        logger.debug(`findOne: ${result}`);    
        response.send(filterVariants(result, variants, sequence));
    });
});

//Insert graph if not exist, Replace graph if exist
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