
const express = require('express');
// ## Controller
// ### CRUD
const graphCreate = require('../controller/crud/graphCreate.js');         
const graphRead = require('../controller/crud/graphRead.js');              
const graphRename = require('../controller/crud/graphRename.js');      
const graphDelete = require('../controller/crud/graphDelete.js');          
const graphIds = require('../controller/crud/graphIds.js');               

// ## Import
const importGraphmlAsDfg = require('../controller/import/graphmlAsDfg.js');
const importEpmlAsEpc = require('../controller/import/epmlAsEpc.js'); 

// ## Export
const exportDfgAsGraphml = require('../controller/export/dfgAsGraphml.js');  
const exportEpcAsEpml = require('../controller/export/epcAsEpml.js');        

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
    appRouter.post('/import', importGraphmlAsDfg);
    appRouter.post('/import', importEpmlAsEpc);

    // ## Export    
    appRouter.post('/download/dfg/:_id', exportDfgAsGraphml);    
    appRouter.post('/download/epc/:_id', exportEpcAsEpml);
}

module.exports = setAppRouter;
