const path = require('path');
const app = require('electron').app ;
// const sqlite = require('sqlite-async');

var userData = {};

var appParams = {

  getDBName: function(){
    return 'sqlite3'
  },
  getDBPath: function(){
    return path.join(app.getPath('userData'),'./ledgerDB.sqlite3');
  },

  getUserData: function(){
    return userData;
  },
  setUserData: function(data){
    userData.name = data.name;
    userData.address = data.address;
    userData.email = data.email;
    userData.phone = data.phone;
  } 

}

module.exports = appParams;


/* Functions */
