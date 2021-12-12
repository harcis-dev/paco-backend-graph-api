/**
 * @file API - main
 * @author HARCIS-DEV TEAM
 */

const express = require('express');
const app = express();
const appRouter = express.Router();

// Run-Confgis
const nodeEnv = process.env.NODE_ENV || 'development';
const serverPort = process.env.SERVER_PORT || 8080;
const setAppRouter = require('./routes/routes.js')

// Database
const mongoListener = require('./database/mongodb.js')

// Logging
const logger = require('./utils/log/log.js');

app.listen(serverPort, mongoListener);

setAppRouter(appRouter);

app.use('/graph', appRouter);

logger.info(`Service started in ${nodeEnv}-Mode on Port ${serverPort}`);