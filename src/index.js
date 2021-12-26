/**
 * @file API - main
 * @author HARCIS-DEV TEAM
 */

const express = require('express');
const app = express();
const appRouter = express.Router();
const mongodb = require('./database/mongodb.js')

// Run-Confgis
const nodeEnv = process.env.NODE_ENV || 'development';
const serverPort = process.env.SERVER_PORT || 8080;
const setAppRouter = require('./routes/routes.js')

// Logging
const logger = require('./utils/log/log.js');

mongodb.connectToServer( function( err, client ) {
    if (err) console.log(err);
    app.listen(serverPort);

    setAppRouter(appRouter);

    app.use('/graph', appRouter);

    logger.info(`Service started in ${nodeEnv}-Mode on Port ${serverPort}`);
  } );


