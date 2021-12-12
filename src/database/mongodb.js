const mongoClient = require('mongodb').MongoClient;
const mongodbHost = process.env.MONGODB_DOMAIN || "127.0.0.1";
const mongodbPort = process.env.MONGODB_PORT || "27017";
const mongodbUrl = `mongodb://${mongodbHost}:${mongodbPort}/`;
// ${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@
const mongodbName = process.env.MONGODB_DATABASE || 'graph-database';
const mongodbCollection = process.env.MONGODB_COLLECTION || 'graph-collection';

const logger = require('../utils/log/log.js');

function mongoListener() {
    mongoClient.connect(mongodbUrl, {
        useNewUrlParser: true
    }, (error, client) => {
        if (error) {
            logger.error(`${error}`);
            throw error;
        }
        database = client.db(mongodbName);
        collection = database.collection(mongodbCollection);
        collection.createIndex({
            "name": 1
        }, {
            unique: true
        }, (error) => {
            if (error) {
                logger.error(`${error}`);
            }
        });
        logger.info(`Connected to Database: ${mongodbName}. Collection: ${mongodbCollection}.`);
    });
}

module.exports = mongoListener;