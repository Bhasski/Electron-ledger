var my_html_magic_lib = my_html_magic_lib || (function(){
    var ipc  = require('electron').ipcRenderer
    
    function doActionsOnConent(e,isSetUpNeeded){
        let that = e.currentTarget ;
        if(e.target && e.target.matches("#bt-setup-form button")){// master add
            e.preventDefault();
            // e.stopPropagation();
            let data = {};
            data.name = document.getElementById("master_name").value;
            data.address = document.getElementById("master_address").value;
            data.phone = document.getElementById("master_phone").value;
            data.email = document.getElementById("master_email").value;
            ipc.send('loadMasterDataOnSetup',data);
            
        }
        if(e.target && e.target.matches("#product-add-submit")){// Product Add
            e.preventDefault();
            // e.stopPropagation();
            let data = {};
            data.table = "Product"
            data.name = document.getElementById("product-add-name").value;
            data.dom = document.getElementById("product-add-dom").value;
            data.doe = document.getElementById("product-add-doe").value;
            data.manufacturer = document.getElementById("product-add-manufacturer").value;
            ipc.send('saveProduct',data);
            
        }// if
        if(e.target && e.target.matches("#business-add-submit")){// Product Add
            e.preventDefault();
            // e.stopPropagation();
            let data = {};
            data.table = "Business"
            data.name = document.getElementById("business-add-name").value;
            data.address = document.getElementById("business-add-address").value;
            data.phone = document.getElementById("business-add-phone").value;
            data.email = document.getElementById("business-add-email").value;
            data.proprietor = document.getElementById("business-add-proprietor").value;
            ipc.send('saveBusiness',data);
            
        }// if
        
        if(e.target && e.target.matches(".nav-tabs li a")){// tab-pane top btn text and class manipulation
            e.preventDefault();
            e.stopPropagation();// stopped for bootstrap functionality to work
            _makeTabActiveWithoutContent(e.target)
            hideActiveTabPane()
            let href = e.target.getAttribute("href").toString().trim();
            let actionDivEl = that.firstChild.nextElementSibling.nextElementSibling
            let spanEl = actionDivEl.querySelector("button span")
            let spanClass = "glyphicon glyphicon-plus"
            let prvTextNode = spanEl.parentNode.childNodes[2]; 
            let btnStr
            if (href === "#add-master" ){
                spanClass = (isSetUpNeeded)?"glyphicon glyphicon-plus": "glyphicon glyphicon-edit";
                btnStr = (isSetUpNeeded)?" Add Master":" Edit Master";
                spanEl.className = spanClass;
                spanEl.parentNode.removeChild(prvTextNode)//remove the previous text node
                spanEl.parentNode.appendChild(document.createTextNode(btnStr))
                sendTableForRecordBox("LedgerMaster") 
            }
            if (href === "#add-product"){
                btnStr = " Add Product"
                spanEl.className = spanClass;
                spanEl.parentNode.removeChild(prvTextNode)//remove the previous text node
                spanEl.parentNode.appendChild(document.createTextNode(btnStr)) 
                sendTableForRecordBox("Product")
            }
            if (href === "#add-business"){
                btnStr = " Add Business"
                spanEl.className = spanClass;
                spanEl.parentNode.removeChild(prvTextNode)//remove the previous text node
                spanEl.parentNode.appendChild(document.createTextNode(btnStr)) 
                sendTableForRecordBox("Business")
            }
            
        }// if
        
        if(e.target && e.target.matches(".bt-tab-pane-top-btn-box button")){
            if(e.target.childNodes[2].nodeValue.includes("Master")){
                _showTabPane("#bt-add-content-box .tab-content .tab-pane#add-master")
            }
            if(e.target.childNodes[2].nodeValue.includes("Product")){
                _showTabPane("#bt-add-content-box .tab-content .tab-pane#add-product")
            }
            if(e.target.childNodes[2].nodeValue.includes("Business")){
                _showTabPane("#bt-add-content-box .tab-content .tab-pane#add-business")
            }
        }
        
    }



    function _hideActiveTab(){
        let activeTabEl = document.querySelector(".nav-tabs li.active")
        if(activeTabEl) activeTabEl.classList.remove("active")

    }
    function hideActiveTabPane(){
        let tab_paneEl = document.querySelector("#bt-add-content-box .tab-content .tab-pane.active")
        if(tab_paneEl) tab_paneEl.classList.remove("active")
    }


    function _makeTabActiveWithoutContent(node){
        _hideActiveTab()
         if(node.nodeName){
            node.parentNode.classList.add("active")
         }else{ // querySelector passed
             document.querySelector(node).classList.add("active")
         }

    }

    function _showTabPane(selector){
        hideActiveTabPane();
        let tab_paneEl = document.querySelector(selector)
                if(tab_paneEl) tab_paneEl.classList.add("active")    
                if(tab_paneEl) tab_paneEl.classList.add("in")    
    }

    
    function tabBtnAndContentActiveState(selectorTab,selectorPane){
        _makeTabActiveWithoutContent(selectorTab);
        _showTabPane(selectorPane)
    }

    function sendTableForRecordBox(table){
        // console.log("Table: ",table)
        if(table){
            ipc.send("tableForRecordBox",table)
        }
    }


    return{
        doActionOnContent:function(event,isSetUpNeeded){
            doActionsOnConent(event,isSetUpNeeded);
        },
        hideActiveTabPane:hideActiveTabPane,
        makeTabActive:tabBtnAndContentActiveState,
        sendTableForRecordBox:sendTableForRecordBox

    }
})();

module.exports = my_html_magic_lib;