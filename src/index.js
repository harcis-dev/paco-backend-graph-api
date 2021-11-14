/**
 * @file API - main and routes
 */

const express = require('express');
const app = express();
const appRouter = express.Router();

require('dotenv').config({path: require('find-config')(`.env`)})

// Run-Confgis
const nodeEnv = process.env.NODE_ENV || 'development';
const serverPort = process.env.SERVER_PORT || 8080;

// Database
const mongoListener = require('./database/mongodb.js')

// Controller
const graphCreate = require('./controller/crud/graphCreate.js');            // POST
const graphRead = require('./controller/crud/graphRead.js');                // POST
const graphDelete = require('./controller/crud/graphDelete.js');            // DELETE
const graphIds = require('./controller/crud/graphIds.js');                  // GET
const dfgAsGraphml = require('./controller/download/dfgAsGraphml.js');      // POST

// Logging
const logger = require('./utils/log/log.js'); 


app.listen(serverPort, mongoListener);

appRouter.use(express.json());
appRouter.use(express.urlencoded({extended: true}));

// Routes
appRouter.post('/', graphCreate);

appRouter.post('/filter', graphRead);

appRouter.delete('/', graphDelete);

appRouter.get('/ids', graphIds);

appRouter.post('/download', dfgAsGraphml);

app.use('/graph', appRouter); 

logger.info(`Service started in ${nodeEnv}-Mode on Port ${serverPort}`);
