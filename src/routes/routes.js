/**
 * @file Select controller for routes
 * @author HARCIS-DEV TEAM
 */

const express = require('express');
// ## Controller
// ### CRUD
const graphCreate = require('../controller/crud/graphCreate.js');
const graphRead = require('../controller/crud/graphRead.js');
const graphRename = require('../controller/crud/graphRename.js');
const graphDelete = require('../controller/crud/graphDelete.js');
const graphIds = require('../controller/crud/graphIds.js');

// ## Import
const importGraph = require('../controller/import/importGraph.js');

// ## Export
const exportDfgAsGraphml = require('../controller/export/dfgAsGraphml.js');
const exportEpcAsEpml = require('../controller/export/epcAsEpml.js');
/**
 * Setting routes for App with express.Router
 * @param {express.Router} appRouter 
 */
function setAppRouter(appRouter) {

    appRouter.use(express.json());
    appRouter.use(express.urlencoded({
        extended: true
    }));

    // ## Import
    appRouter.post('/import', importGraph);

    // ### CRUD
    appRouter.post('/', graphCreate);
    appRouter.post('/:_id', graphRead);
    appRouter.put('/:_id', graphRename);
    appRouter.delete('/:_id', graphDelete);
    appRouter.get('/ids', graphIds);

    // ## Export    
    appRouter.post('/download/dfg/:_id', exportDfgAsGraphml);
    appRouter.post('/download/epc/:_id', exportEpcAsEpml);
}

module.exports = setAppRouter;