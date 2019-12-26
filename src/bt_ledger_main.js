// pattern to look for 

var LEDGER_MAINS = LEDGER_MAINS || (function(){
    'use strict';
    var tableColumnMapper = require('./bt-column-name-mapper');
    var appDao = require('./dao/AppDao')
    // var _ipc =  require('electron').ipcRenderer 
    var _appObject = {
        bt_tables: tableColumnMapper
    }
    
    
    
    function _getInsertClauseQuery(data){
        let str = "("
        let corrrespondStr = " Values("
        let tableStruct = _appObject.bt_tables[data.table]
        for (var dataKey in tableStruct){
            if(data[dataKey]){
                str += tableStruct[dataKey]+",";
                corrrespondStr += "'"+data[dataKey]+"'," 
            }
        }
        str = str.substring(0, str.length - 1)+")"
        corrrespondStr = corrrespondStr.substring(0, corrrespondStr.length - 1)+")"
        
        return (str+corrrespondStr);
    }
    
    function getSimpleInsertQuery(data){
        let query;
        let initStr = null;
        if(data && !_isEmptyObj(data)){
            query = "Insert into "+ data.table;
            query += _getInsertClauseQuery(data);
        }else{
            console.log("Error: Give data object as argument !!")
        }
        console.log(query)
        return query;
    }//
    
    
    function saveObjectInDatabase(data,myCallback){
        if( data && !_isEmptyObj(data)){
            appDao.insertOrUpdate(getSimpleInsertQuery(data),[],(err,notificationOptions)=>{
                if(myCallback) myCallback(err,notificationOptions)
            })
        }else{
            console.log("Error: no proper data")
        }
        
    }
    function _doUpdateProduct(data){
        
    }
    
    function getLatestRecords(tableName,limit,myCallback){
        let tableColumnMap = _appObject.bt_tables[tableName]
        let definedId = (tableColumnMap)? tableColumnMap["id"]: undefined;
        if (definedId){
            let sql = "Select * from "+tableName +" Order By "+definedId+" Desc "
            sql+= (limit)?" limit "+limit+";":";"
            // console.log("Query: ",sql)
            console.log("ledger_mains<getlatesrecords> colum id to get: ",definedId)
            appDao.getFromDatabase(sql,[],(err,rows)=>{
                if(err){console.log(err)}else{
                    myCallback(err,rows)  
                } 
            })
        }else{
            console.log("ERROR! : <"+tableName+"> table not found in table mapper")
        }
    }
    
    function setTransactionTableModalData(data,myCallback){
        let sql ;
        let conditionStr;
        if (!_isEmptyObj(data.condition)){
            conditionStr = " where "
            for (let key in data.condition){
                conditionStr += tableColumnMapper[data.table][key] +"='"+data.condition[key]+"' and "
            }
            conditionStr = conditionStr.substring(0, conditionStr.length - 4)+";"
        }
        let mainClause = "Select distinct "+ tableColumnMapper[data.table][data.column]+" from "+data.table
        sql = (conditionStr)? mainClause + conditionStr : mainClause
        console.log(sql)
        appDao.getFromDatabase(sql,[],(err,rows)=>{
            if(err){console.log(err)}
            else{myCallback(err,rows)}
        })
                    
    }
    
    
    
    // Helper functions
    function _isEmptyObj(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }//
    
    function _whatIsIt(object) {
        if (object === null) {
            return "null";
        }
        if (object === undefined) {
            return "undefined";
        }
        if (object.constructor === stringConstructor) {
            return "String";
        }
        if (object.constructor === arrayConstructor) {
            return "Array";
        }
        if (object.constructor === objectConstructor) {
            return "Object";
        }
        {
            return "don't know";
        }
    }   // end whatisit
    
    return {
        init : function(Args) {
            _args = Args;
            // some other initialising
        },
        getTables: function(){
            return _appObject.bt_tables;
        },
        getInsertQuery: getSimpleInsertQuery,
        saveObject: saveObjectInDatabase,
        getLatestRecords: getLatestRecords,
        setTransactionTableModalData: setTransactionTableModalData
        
        
    };// return
    
}());

module.exports = LEDGER_MAINS;

