function getWindowBounds(remote){
    const bounds = remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds();
    return bounds;
}

(function () {
    // Retrieve remote BrowserWindow
    const remote = require('electron').remote
    const bounds = getWindowBounds(remote)
    var currHeight = bounds.height;
    var currWidth = bounds.width;
    
    var maxWinFlag = false;
    
    document.addEventListener("DOMContentLoaded",(e)=>{
        
        /* window button functions */
        
        var window = remote.getCurrentWindow();
        document.getElementById("app-close-bt").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.close();
        });
        
        // console.log($.fn.jquery); /* jquery check */
        document.getElementById("app-minimize-bt").addEventListener("click",(e)=>{
            e.stopPropagation();
            window.minimize();
            
        })
        var maxBtn = document.getElementById("app-maximize-bt");
        maxBtn.addEventListener("click",(e)=>{
            e.stopPropagation();
            if(!maxWinFlag){
                window.maximize();
                maxBtn.innerHTML = "+/-";
                maxWinFlag = true;
            }else{
                maxBtn.innerHTML = "+";
                window.setFullScreen(false);
                window.setSize(currWidth,currHeight,false)
                maxWinFlag = false;
            }
            
        })
        
        
        // other functions after navigation buttons script  
        var ipc = require("electron").ipcRenderer;
        var global_shared = remote.getGlobal('sharedObj');
        var global_userdata = global_shared.userData;
        var my_html_magic_lib = require('./js_action_on_html')
        
        var sidebar_navs = document.querySelectorAll(".bt-sidebar-nav li a");
        
        /* App default launch nav state */
        if(global_shared !== undefined){
            var isSetUpNeeded = global_shared.isSetUpNeeded;
            if(isSetUpNeeded){
                console.log("is set up needed : ",isSetUpNeeded)
                var setupElem = sidebar_navs[sidebar_navs.length-1]
                setTimeout(function(){
                    setupElem.click();
                },20)
            }else{
                var defaultElem = document.querySelector(".bt-sidebar-nav li a#default")
                setTimeout(function(){
                    defaultElem.click(); //hack for click
                    my_html_magic_lib.sendTableForRecordBox("Product") //Product is hard coded state already
                },20)
            }// end if else 
            
            
            if(global_userdata !== undefined){
                if (!isEmptyObj(global_userdata)){
                    let resultEl = document.getElementById("master-details-header");
                    var row = global_userdata;
                    resultEl.innerHTML = row['name']+"<br/> <h5 style=\"color:#777;\" >"+
                    row['address']+"&nbsp;(Mobile: "+row['phone']+")</h5>";
                    
                }
            }// end if
        }//end if global_shared
        
        
        
        
        // take  DATA from different forms and send to main.js for further process 
        document.getElementById("bt-add-content-box").addEventListener("click",(e)=>{
            my_html_magic_lib.doActionOnSetUpContent(e,isSetUpNeeded);
        })// end 'click' delegation on content box
        
        
        
        function isEmptyObj(obj) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key))
                return false;
            }
            return true;
        }
        
        /* getting data for side-navbar */
        
        var fullSidebarEl = document.getElementsByClassName('bt-sidebar')[0]; // parent for delegation
        fullSidebarEl.addEventListener("click",(e)=>{
            if(e.target && e.target.matches(".bt-sidebar-nav li a")){
                e.preventDefault();
                var that = e.target;
                that.style.backgroundColor = 'rgb(119, 121, 141)'; // hack for a elem loosing color on click
                var file = that.getAttribute("data-file");
                var prvActiveElem = document.querySelector(".bt-sidebar-nav li.active")
                prvActiveElem.classList.remove("active"); //IE9 not supported
                that.parentNode.classList.add("active")
                var xhr= new XMLHttpRequest();
                xhr.open('GET', file, true);
                xhr.onreadystatechange= function() {
                    if (this.readyState!==4) return;
                    if (this.status!==200) return; // or whatever error handling you want
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        var elem = document.getElementById("bt-add-content-box")
                        elem.innerHTML = xhr.responseText;
                        if(!isSetUpNeeded){
                            let tabPaneActionEl = document.querySelector(".bt-tab-pane-top-btn-box")
                            // console.log("Hiiisss")
                            // if(tabPaneActionEl) my_html_magic_lib.hideActiveTabPane()
                        }else{
                            my_html_magic_lib.makeTabActive("ul.nav-tabs li.add-master","#bt-add-content-box .tab-content .tab-pane#add-master")
                        }
                    }
                };
                xhr.send();
                
                if(file ==="setup.html")my_html_magic_lib.sendTableForRecordBox("Product") //click changes to product data
            } // end if 
        }) // sidebar clicks close
        



        /* Tabinf html  magic  on table */
        document.getElementById("bt-add-content-box").addEventListener("focusin",my_html_magic_lib.actionOnTransactionModals)// focusin
        
        document.getElementById("bt-add-content-box").addEventListener("keyup",(e)=>{
            my_html_magic_lib.actionOnTableModalKeyUp(e)
            //filter on data
            if((e.target.nodeName=='TD')&& (e.target.getAttribute("get-data"))){
                let value = $(e.target).text().toLowerCase();
                var filterLength = $("#bt-modal-on-table-column div b").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                }).length 
                // console.log(filterLength) 
            }
        })//key up
        
        document.getElementById("bt-add-content-box").addEventListener("mousedown",(e)=>{
            if(e.button ==0) my_html_magic_lib.sendTableModalDataToParent(e)
        })//mouse down
        
        
        
        
        /*--------------------- IPC Section -----------------*/
        ipc.on("initData", function(evt,result){
            let resultEl = document.getElementById("master-details-header");
            console.log("#### ",result);
            for(row of result){
                resultEl.innerHTML = row['master_name']+"<br/> <h5 style=\"color:#777;\" >"+
                row['master_address']+"&nbsp;(Mobile: "+row['master_phone']+")</h5>";
            }
        })
        
        ipc.on("dataForRecordBox",(ev,data)=>{
            if(!isEmptyObj(data)){
                let recordEl = document.getElementById("bt-below-content")
                let tHeadStr;
                let tBodyStr = "<tbody>"
                for (row of data){
                    tHeadStr = "<thead>"
                    tBodyStr += "<tr>"
                    for (key in row){
                        tHeadStr += "<th>"+key+"</th>"
                        tBodyStr += (key.includes("name"))? "<td><b>"+row[key]+"</b></td>":(row[key] == null)? "<td>"+" NA "+"</td>":"<td>"+row[key]+"</td>"
                    }
                    tBodyStr += "<td><a><span class=\"glyphicon glyphicon-edit\"></span></td></a></tr>"
                }
                tHeadStr += "<th>Action</th></thead>"
                tBodyStr += "</tbody>"
                let htmlStr = "<table class=\"table table-bordered table-condensed table-hover table-striped\">"+tHeadStr+tBodyStr+"</table>"
                recordEl.innerHTML = htmlStr// let record box be there
                
            }// if not empty
        }) //ipc for record Box
        
        ipc.on("onDataForTransactionModal",(ev,data)=>{
            var modalEl = document.getElementById("bt-modal-on-table-column")
            // console.log(data)
            let htmlStr =""
            for (row of data.rows){
                for(key in row){
                    htmlStr +="<div tabIndex=\""+data.tabIndex+"\" class=\"table-modal-content\"><b>"+row[key]+"</b></div>"
                }
            }
            modalEl.innerHTML =htmlStr;
        })// ipc for tx table modal
        
        
    })// on content load
    
})();