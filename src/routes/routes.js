/**
 * @file Select controller for routes
 * @author HARCIS-DEV TEAM
 */

const express = require('express');
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

/**
 * Setting routes for App with express.Router
 * @param {express.Router} appRouter 
 */
function setAppRouter(appRouter) {

    appRouter.use(express.json());
    appRouter.use(express.urlencoded({
        extended: true
    }));

    // # graph

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