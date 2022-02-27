/**
 * @file Select controller for routes
 * @author HARCIS-DEV TEAM
 */


const express = require('express');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: './upload',
    filename: function (req, file, cb) {
        cb(null , file.originalname.split(".")[0] + "_" + Date.now() + ".csv");
    }
});
const upload = multer({ storage: storage});
// ## Controller

// ### Graph

// #### CRUD
const graphCreate = require('../controller/graph/crud/graphCreate.js');
const graphRead = require('../controller/graph/crud/graphRead.js');
const graphRename = require('../controller/graph/crud/graphRename.js');
const graphDelete = require('../controller/graph/crud/graphDelete.js');
const graphIds = require('../controller/graph/crud/graphIds.js');

// #### Import
const importGraph = require('../controller/graph/import/importGraph.js');

// #### Export
const exportDfgAsGraphml = require('../controller/graph/export/dfgAsGraphml.js');
const exportEpcAsEpml = require('../controller/graph/export/epcAsEpml.js');

// ### CSV

// #### CRUD
const csvDelete = require('../controller/csv/crud/csvDelete.js');
const csvIds = require('../controller/csv/crud/csvIds.js');
const csvPreview = require('../controller/csv/crud/csvPreview.js');

// #### Import
const csvImport = require('../controller/csv/import/csvImport.js');

// #### Export
const csvExport = require('../controller/csv/export/csvExport.js');

/**
 * Setting routes for App with express.Router
 * @param {express.Router} appRouter 
 */
function setAppRouter(appRouter) {

    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger.json');

    appRouter.use(express.json());
    appRouter.use(express.urlencoded({
        extended: true
    }));


    //appRouter.use(upload.array()); 
    appRouter.use(express.static('public'));
    
    // # API Documentation
    appRouter.use('/api-docs', swaggerUi.serve);
    appRouter.get('/api-docs', swaggerUi.setup(swaggerDocument));

    // # graph
    // ## Import
    appRouter.post('/import', importGraph);

    // ## CRUD
    appRouter.post('/', graphCreate);
    appRouter.post('/:_id', graphRead);
    appRouter.put('/:_id', graphRename);
    appRouter.delete('/:_id', graphDelete);
    appRouter.get('/ids', graphIds);

    // ## Export    
    appRouter.post('/download/dfg/:_id', exportDfgAsGraphml);
    appRouter.post('/download/epc/:_id', exportEpcAsEpml);

    // # CSV
    // ## CRUD
    appRouter.get('/csv/ids', csvIds);
    appRouter.delete('/csv/:_id', csvDelete);
    appRouter.post('/csv/preview/:_id', csvPreview);
    // ## Import
    appRouter.post('/csv/import', upload.single('file'), csvImport);
    // ## Export
    appRouter.get('/csv/download/:_id', csvExport);

    
}

module.exports = setAppRouter;