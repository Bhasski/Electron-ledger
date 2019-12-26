
var AppDAO  = {

    getDaoParams: function(){
        var appParam = require('../AppParam');
        var options = {
            clientName:appParam.getDBName(),
            clientModule: require(appParam.getDBName()),
            dbPath: appParam.getDBPath(),
        } 
        return options;
    },
    getKnex: function(){
        var knex = require('knex')({
            client: this.getDaoParams().clientName,
            connection:{
                filename:this.getDaoParams().dbPath
            }
        })
        return knex;
    },
    _getDB: function(){
        var clientModule = this.getDaoParams().clientModule;
        var db = new clientModule.Database(this.getDaoParams().dbPath, (err) => {
            if (err) {
                console.log('Could not connect to database', err)
            } else {
                console.log('---------->  Connected to database')
            }
        })
        return db;
    },
    
    insertOrUpdate: function(sql, params = [],myCallback) {
        var db = this._getDB();
        db.serialize(function(){
            db.run(sql, params, function(err) {
                let noticationOptions = {}
                if(err){
                    noticationOptions = {title:"Database Error",body:err}
                }else{
                    noticationOptions ={title:"Success ",body:"DONE: saved."}
                }
                db.close();
                if (myCallback) myCallback(err,noticationOptions);
            })
        })
    },
    getFromDatabase: function(sql, params = [],myCallback) {
        var db = this._getDB();
        // var allRecs = []
        db.serialize(function(){
            db.all(sql, params, function (err,rows) {
                if(err)console.log(err)
                db.close()
                if(myCallback) myCallback(err,rows)
            })
        })
    },
    
    parseSQLFileIntoQueries: function(filePath){
        var fs = require('fs');
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            var queryArr = data.toString().split(";");
            
            for (var i= 0; i <queryArr.length; i++){
                queryArr[i] = queryArr[i].trim();
                if(queryArr[i] === "") queryArr.pop();
            }
            // console.log(queryArr.length,'*****');
            return queryArr;
        } catch (err) {
            console.error(err)
        }
    },
    
    runMultiQuery: async function(queryArr,start){
        var db = await this._getDB();
        for (var i= start; i < queryArr.length ;i++){
            if(queryArr[i].match(/(INSERT|CREATE|DROP|PRAGMA|BEGIN|COMMIT)/)) {
                db.serialize(function(){
                    // console.log('------------>',' ** '+i+' **', queryArr[i]);
                    db.run(queryArr[i]+';',(err)=>{
                        if(err) console.log("Error: ", err,'** '+i+' **-- ',queryArr.length); 
                    })
                })
            }
        }//for
        db.close();
    },
    testAsync: async function(){
        return '27'
    }
    
}// Appdao

module.exports = AppDAO;