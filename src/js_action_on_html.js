var my_html_magic_lib = my_html_magic_lib || (function(){
    var ipc  = require('electron').ipcRenderer
    
    function doActionsOnSetUpConent(e,isSetUpNeeded){
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
            data.variety = document.getElementById("product-add-variety").value;
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
            let actionDivEl = that.querySelector(".bt-tab-pane-top-btn-box")
            
            if(actionDivEl){
                e.stopPropagation();// stopped for bootstrap functionality to work
                _makeTabActiveWithoutContent(e.target)
                hideActiveTabPane()
                let href = e.target.getAttribute("href").toString().trim();
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
                
            } //if action button insside tap pane present
            
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
    
    
    let tdModalCondtionToFetchData = {}//global
    
    function actionOnTableModalKeyUp(e){
        if(e.keyCode == '40'){
            if(e.target.className == "table-modal-content"){
                if (e.target.nextElementSibling) e.target.nextElementSibling.focus()
            }
        }//down arrow
        if(e.keyCode == '38'){
            if(e.target.className == "table-modal-content" ){
                if (e.target.previousElementSibling) e.target.previousElementSibling.focus()
            }
        }//up arrow
        if(e.key=="Tab" || e.keyCode == '9'){
            actionOnTransactionModals(e)
        }//key COde TAB
        
        if(e.key=="Enter" || e.keyCode == '13'){
            // console.log(e.target.className)
            sendTableModalDataToParent(e)
            
        }// key code ENTER
    }
    
    function actionOnTransactionModals(e){
        let that = e.currentTarget;
        if(e.target.nodeName =="TD" && e.target.getAttribute("get-data")){
            let currTabIndex = e.target.getAttribute("tabIndex")
            let tabIndexForModal = parseInt(currTabIndex)+1
            let tabIndexForSiblings = parseInt(currTabIndex)+3
            
            // pretext for data
            let colAttr = e.target.getAttribute("get-data")
            let table  = colAttr.split("-")[0]
            let tableColumnToFetch = colAttr.split("-")[1]
            var offset =  _offset(e.target)
            let targetWidth = e.target.offsetWidth
            let nextAllSiblings = $(e.target).nextAll()
            nextAllSiblings.attr("tabIndex",tabIndexForSiblings)// IMPORTANT! changing tabIndex for comings TDs
            nextAllSiblings.each((ev,item)=>{
                // console.log($(item).find("select,input").length)
                if($(item).find("select,input,button").length >0){
                    $(item).attr("tabIndex","-1")
                    $(item).find("select,input,button").attr("tabIndex",parseInt(tabIndexForSiblings))
                }
            })
            
            if(!e.target.isSameNode(e.target.parentNode.firstElementChild)){
                
                if(that.querySelector("td.active-modal")){ //previous active modal if there
                    let prevModalColumn = that.querySelector("td.active-modal");
                    let prvColAttr = prevModalColumn.getAttribute("get-data")
                    let isPrevElDataSet = that.querySelector("td.active-modal").getAttribute("data-set")
                    if(isPrevElDataSet =="true"){
                        tdModalCondtionToFetchData[prvColAttr.split("-")[1]] = prevModalColumn.innerHTML 
                    }
                }
            }else{  // check for first child,to clear conditions
                tdModalCondtionToFetchData = {}
            }
            // remove the class now
            if(that.querySelector("td.active-modal")){
                that.querySelector("td.active-modal").classList.remove("active-modal")
            }
            let data = {table:table,column:tableColumnToFetch,condition:tdModalCondtionToFetchData}
            
            let modalOptions = {
                offset:offset,
                width:targetWidth,
                tabIndex:tabIndexForModal
            }
            
            
            e.target.classList.add("active-modal")
            ipc.send("setTransactionModalData",data)
            showTableColumnModal(modalOptions,targetWidth)
            
        }// td with data
        
        
    }
    
    function sendTableModalDataToParent(e){
        if(e.target.className == "table-modal-content" || e.target.parentNode.className =="table-modal-content"){
            let parentTableCol = document.querySelector("td.active-modal")
            parentTableCol.innerHTML = e.target.innerText
            if (e.target.className == "table-modal-content") e.target.parentNode.style.display = "none"
            if (e.target.parentNode.className =="table-modal-content") e.target.parentNode.parentNode.style.display = "none"
            parentTableCol.setAttribute("data-set","true")
            parentTableCol.nextElementSibling.focus()
        }
    }
    
    function showTableColumnModal(modalOptions){
        var modalEl = document.getElementById("bt-modal-on-table-column")
        modalEl.style.top = (modalOptions.offset.top+35)+"px"
        modalEl.style.left = (modalOptions.offset.left)+"px"
        modalEl.style.width = (modalOptions.width+20)+"px"
        setTimeout(() => {
            Array.from(modalEl.querySelectorAll(".table-modal-content")).forEach((node)=>{
                // console.log(node)
                if(node)node.setAttribute("tabIndex",modalOptions.tabIndex)
            })
        }, 15);
        modalEl.style.display = "block"
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
    function _offset(el) {
        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
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
        doActionOnSetUpContent:function(event,isSetUpNeeded){
            doActionsOnSetUpConent(event,isSetUpNeeded);
        },
        hideActiveTabPane: hideActiveTabPane,
        makeTabActive: tabBtnAndContentActiveState,
        sendTableForRecordBox: sendTableForRecordBox,
        actionOnTableModalKeyUp: actionOnTableModalKeyUp,
        actionOnTransactionModals: actionOnTransactionModals,
        sendTableModalDataToParent: sendTableModalDataToParent
        
    }
})();

module.exports = my_html_magic_lib;