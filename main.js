
const {BrowserWindow, app, Menu, screen,Notification} =  require('electron');
const session = require('electron').session



/* HOT reload files , not for production*/
require('electron-reload')(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`)
});
/* ------------ END HOTLOADING -------------------- */


const contextMenu = require('electron-context-menu');
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: 'Rainbow',
      // Only show it when right-clicking images
      visible: params.mediaType === 'image'
    },
    {
      label: 'Search Google for “{selection}”',
      // Only show it when right-clicking text
      visible: params.selectionText.trim().length > 0,
      click: () => {
        shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
      }
    }
  ]
});



const path = require('path')
const ipc = require('electron').ipcMain
const appDao = require('./src/dao/AppDao')
const myLedgerMains = require('./src/bt_ledger_main')
const tableColumnMapper = require('./src/bt-column-name-mapper')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let myWin
let loadingFile;

const gotTheLock = app.requestSingleInstanceLock()
console.log(gotTheLock +' got the lock');


if (gotTheLock) {
  /* Sqllite 3 test  SQLite3 server file - bootstrap  Create and insert */
  // require('./server/sqlite3/server.js');
  
  // Create myWin, load the rest of the app, etc...
  app.on('ready',() =>{
    // precheck app before loading for 1st time settings
    performAppLoad(doAfterBootstrapDB);
    session.defaultSession.cookies.get({})
    .then((cookies) => {
      console.log("cookies: ",cookies)
    }).catch((error) => {
      console.log(error)
    })
    
  })
} else {
  app.quit()
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (myWin) {
    if (myWin.isMinimized()){
      myWin.restore();
      myWin.focus();
      myWin.show();
    }
  }
})

app.on('before-quit', () => {
  myWin.removeAllListeners('close');
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (myWin === null) {
    createWindow(loadingFile)
  }
})




// ************ Functions Below ***********


function createWindow (fileName) {
  
  // Create the browser window.
  if (fileName){
    let display = screen.getPrimaryDisplay();
    var fullscreenWidth = display.workAreaSize.width;
    var fullscreenHeight = display.workAreaSize.height;
    
    var optimumWidth = parseInt((0.9*fullscreenWidth),10);
    var optimumHeight = parseInt((0.9*fullscreenHeight),10);
    
    var minHeight = parseInt((0.9*optimumHeight),10);
    var minWidth = parseInt((0.9*optimumWidth),10);
    
    myWin = new BrowserWindow({
      width: optimumWidth,
      height: optimumHeight,
      maxWidth: fullscreenWidth,
      maxHeight:fullscreenHeight,
      minWidth: minWidth,
      minHeight: minHeight,
      frame:false,
      center:true,
      resizable:true,
      webPreferences: {
        nodeIntegration: true
      },
      transparent:true,
      show:false,
      titleBarStyle:"hiddenInset"
      
    })
    
    myWin.loadURL(fileName)
    myWin.once('ready-to-show',()=>{myWin.show()})
    
    myWin.on('closed', () => {
      myWin = null
    })
    Menu.setApplicationMenu(null)
    return myWin;
  }else{
    console.log('wrongly addressed filename');
  }
  
}// createwindow()



function performAppLoad(myCallback){
  appDao.getFromDatabase("SELECT name FROM sqlite_master WHERE type='table' AND name='LedgerMaster';",[],(err,rows)=>{
    if(err){
      console.log(err)
    }else{
      // console.log('executed succesfully and result length: ',rows.length);
      console.log("table name return ",rows);
      if (rows.length === 0) require('./server/sqlite3/Bootstrap_server.js'); // np table found, BOOTSTRAP DB
      myCallback();
    }
  })
}// performAppLoad

function doAfterBootstrapDB(){
  
  appDao.getFromDatabase("Select * from LedgerMaster",[],(err,rows)=>{
    var isSetUpNeeded = true;
    var userData = {}; 
    if( typeof(rows) !== "undefined" ){
      if(rows.length !==0){
        isSetUpNeeded = false;
        for(row of rows){
          userData.name = row['master_name']
          userData.phone = row['master_phone']
          userData.email = row['master_email']
          userData.address = row['master_address']
        }
      }
    }
    global.sharedObj = {'userData': userData,'isSetUpNeeded': isSetUpNeeded}  
    loadingFile = "file://"+__dirname+"/src/index.html";
    var myWindow = createWindow(loadingFile);
    // myWindow.webContents.openDevTools();
  })
}//doAAfterBootsrapDB

function sendInitMasterData(initData,myWindow){
  myWindow.webContents.send('initData',initData);
}

/*----------------------- IPC Below------------- */

ipc.on('loadMasterDataOnSetup',function(event,data){
  global.sharedObj = {'userData': data}
  appDao.getFromDatabase("Select * from LedgerMaster",[],(err,rows)=>{
    if(err){
      console.log(err)
    }else{
      var query;
      var params = [data.name,data.address,data.phone,data.email];
      // console.log("####*** ",rows);
      if(!rows || rows.length === 0 ){
        query = "Insert into LedgerMaster('master_name','master_address','master_phone','master_email') Values(?,?,?,?)";
      }else{
        query = "Update LedgerMaster Set master_name=?,master_address=?,master_phone=?,master_email=? where master_id ="+rows[0].master_id;
      }
      appDao.insertOrUpdate(query,params,(err,rows1)=>{
        if(err){
          console.log(err)
        }else{
          console.log(" : query done")
        }
        appDao.getFromDatabase("Select * from LedgerMaster",[],(err,rows2)=>{
          sendInitMasterData(rows2,myWin);
        })
        
      })
    }
  })
})// ipc


ipc.on("CATCH_NOTIFICATION",(ev,options)=>{
  let n = new Notification(options)
  n.show()
})

ipc.on("saveProduct",(ev,data)=>{
  console.log("data sent :", data)
  myLedgerMains.saveObject(data,(err,notOptions)=>{
    new Notification(notOptions).show()
  })
  
})
ipc.on("saveBusiness",(ev,data)=>{
  console.log("data sent :", data)
  
  myLedgerMains.saveObject(data)
})

ipc.on("tableForRecordBox",(ev,tableName)=>{
  console.log("Table name for records: ",tableName)
  myLedgerMains.getLatestRecords(tableName,5,(err,rows)=>{
    myWin.webContents.send("dataForRecordBox",rows)
  })
})

ipc.on("setTransactionModalData",(ev,data)=>{
  // let filePath = path.join(__dirname,"/src/table_column_data_pop_up.html")
  myLedgerMains.setTransactionTableModalData(data,(err,rows,data)=>{
    data["rows"] = rows;
    myWin.webContents.send("onDataForTransactionModal",data)
  })
})


