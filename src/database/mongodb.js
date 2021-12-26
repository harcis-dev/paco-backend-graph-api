/**
 * @file Connection to Mongo Database
 * @author HARCIS-DEV TEAM
 */

const MongoClient = require('mongodb').MongoClient;
const mongodbHost = process.env.MONGODB_DOMAIN || "127.0.0.1";
const mongodbPort = process.env.MONGODB_PORT || "27017";
const mongodbName = process.env.MONGODB_DATABASE || 'graph-database';
const mongodbUrl = `mongodb://${mongodbHost}:${mongodbPort}/`;
// ${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@

const mongodbGraphCollection = process.env.MONGODB_GRAPH_COLLECTION || 'graph-collection';
const mongodbCsvCollection = process.env.MONGODB_CSV_COLLECTION || 'csv-collection';

const logger = require('../utils/log/log.js');

var database;

/**
 * Creates connection to Mongo Database
 */
 module.exports = {

    connectToServer: function( callback ) {
      MongoClient.connect( mongodbUrl,  { useNewUrlParser: true }, function( error, client ) {
        if (error) {
            logger.error(`${error}`);
            throw error;
        }
        logger.info(`Connected to Database: ${mongodbName}.`);
        database  = client.db(mongodbName);
        return callback( error );
      } );
    },
  
    getDatabase: function() {
      return database;
    },
    mongodbGraphCollection: mongodbGraphCollection,
    mongodbCsvCollection: mongodbCsvCollection
  };

