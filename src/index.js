/**
 * @file API - main and route 
 */

const express = require('express');
const app = express();

require('dotenv').config({path: require('find-config')(`.env`)})

// Run-Confgis
const nodeEnv = process.env.NODE_ENV || 'development';
const serverPort = process.env.SERVER_PORT || 8080;

// Database
const mongoListener = require('./database/mongodb.js')

// Controller
const graphCreate = require('./controller/crud/graphCreate.js');         // POST
//let graphDelete = require('./controller/crud/graphDelete.js');         // DELETE
const graphRead = require('./controller/crud/graphRead.js');           // POST
const graphIds = require('./controller/crud/graphIds.js');            // GET
const dfgAsGraphml = require('./controller/download/dfgAsGraphml.js');    // POST

// Logging
const logger = require('./utils/log/log.js'); 

logger.info(`Service started in ${nodeEnv}-Mode on Port ${serverPort}`);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.listen(serverPort, mongoListener);

app.post('/graph', graphCreate);

app.post('/graph/variants', graphRead);

app.get('/graph/ids', graphIds);

app.post('/graph/download', dfgAsGraphml);
