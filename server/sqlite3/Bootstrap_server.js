const path = require('path');
var bootstrapFilePath = path.resolve(__dirname,'../../assets/sql/bootstrapDB.sql') ;

const AppDao = require('../../src/dao/AppDao')


var boostrapQueryArr = AppDao.parseSQLFileIntoQueries(bootstrapFilePath)

AppDao.runMultiQuery(boostrapQueryArr,0)


