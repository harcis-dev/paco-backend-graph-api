
const express = require('express');
// ## Controller
// ### CRUD
const graphCreate = require('../controller/crud/graphCreate.js');            // POST
const graphRead = require('../controller/crud/graphRead.js');                // POST
const graphRename = require('../controller/crud/graphRename.js');            // PUT
const graphDelete = require('../controller/crud/graphDelete.js');            // DELETE
const graphIds = require('../controller/crud/graphIds.js');                  // GET

// ## Import
const graphmlAsDfg = require('../controller/import/graphmlAsDfg.js');        // POST

// ## Export
const exportDfgAsGraphml = require('../controller/export/dfgAsGraphml.js');  // POST 
const exportEpcAsEpml = require('../controller/export/epcAsEpml.js');        // POST

function setAppRouter(appRouter){
    appRouter.use(express.json());
    appRouter.use(express.urlencoded({extended: true}));
    
    // ### CRUD
    appRouter.post('/', graphCreate);
    
    appRouter.post('/:_id', graphRead);
    
    appRouter.put('/:_id', graphRename);
    
    appRouter.delete('/:_id', graphDelete);
    
    appRouter.get('/ids', graphIds);

    // ## Import
    appRouter.post('/import/dfg', graphmlAsDfg);

    // ## Export    
    appRouter.post('/download/dfg/:_id', exportDfgAsGraphml);
    
    appRouter.post('/download/epc/:_id', exportEpcAsEpml);
}

module.exports = setAppRouter;
