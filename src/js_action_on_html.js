var my_html_magic_lib = my_html_magic_lib || (function(){
    var ipc  = require('electron').ipcRenderer
    

    function _saveObject(data,myCallback){
        ipc.send('saveObject',data);
        setTimeout(() => {if(myCallback) myCallback()}, 10);
    }
    function doActionsOnSetUpConent(e,isSetUpNeeded){
        let that = e.currentTarget ;
        if(e.target && e.target.matches("#bt-master-add-form button")){// master add
            e.preventDefault();
            // e.stopPropagation();
            let data = {};
            data.name = document.getElementById("master_name").value;
            data.address = document.getElementById("master_address").value;
            data.phone = document.getElementById("master_phone").value;
            data.email = document.getElementById("master_email").value;
            ipc.send('loadMasterDataOnSetup',data);
            sendTableForRecordBox("LedgerMaster")
            
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
            _saveObject(data,()=>{sendTableForRecordBox(data.table)})
            
            
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
            _saveObject(data,()=>{sendTableForRecordBox(data.table)})
            
        }// if
        
        if(e.target && e.target.matches(".nav-tabs li a")){// tab-pane top btn text and class manipulation
            // e.preventDefault();
            let actionDivEl = that.querySelector(".bt-tab-pane-top-btn-box")
            
            if(actionDivEl){
                e.stopPropagation();// stopped for bootstrap functionality to work
                _makeTabActiveWithoutContent(e.target)
                // hideActiveTabPane()
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
                    setTimeout(() => {sendTableForRecordBox("LedgerMaster") }, 50);
                }
                if (href === "#add-product"){
                    btnStr = " Add Product"
                    spanEl.className = spanClass;
                    spanEl.parentNode.removeChild(prvTextNode)//remove the previous text node
                    spanEl.parentNode.appendChild(document.createTextNode(btnStr)) 
                    setTimeout(() => {sendTableForRecordBox("Product") }, 50);
                }
                if (href === "#add-business"){
                    btnStr = " Add Business"
                    spanEl.className = spanClass;
                    spanEl.parentNode.removeChild(prvTextNode)//remove the previous text node
                    spanEl.parentNode.appendChild(document.createTextNode(btnStr)) 
                    setTimeout(() => {sendTableForRecordBox("Business") }, 50);
                }
                
            } //if action button insside tap pane present
            
        }// if
        
        if(e.target.matches(".bt-tab-pane-top-btn-box button")|| e.target.matches(".bt-tab-pane-top-btn-box button span")){
            let nodeName = e.target.nodeName;
            let nodeVal = (nodeName =='BUTTON')?e.target.childNodes[2].nodeValue :e.target.nextSibling.nodeValue;
            if(nodeVal.includes("Master")) showAddModal("add-master-form.html")
            if(nodeVal.includes("Product")) showAddModal("add-product-form.html")
            if(nodeVal.includes("Business")) showAddModal("add-business-form.html")
        }// add modal show on button click
        
        if(e.target && (e.target.matches(".btn-close-add-modal")||e.target.matches(".btn-close-add-modal span") )){
            let elem = document.getElementById("bt-add-modal-content").parentNode.parentNode
            elem.style.display="none"
        }
        
    }// function do action on setup content
    
    
    function showAddModal(filePath){
        var xhr= new XMLHttpRequest();
        xhr.open('GET', filePath, true);
        xhr.onreadystatechange= function() {
            if (this.readyState!==4) return;
            if (this.status!==200) return; // or whatever error handling you want
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var elem = document.getElementById("bt-add-modal-content")
                elem.innerHTML = xhr.responseText;
                elem.parentNode.parentNode.style.display="block";
            }
        };
        xhr.send();
        showDatepicker()
    }
    
    
    
    function showDatepicker(){
        setTimeout(()=>{
            $('.form_datetime').datetimepicker({
                language:  'en',
                format:'dd/mm/yyyy', /* 'dd/mm/yyyy hh:ii' */
                /* showMeridian: 1 */
                startView: 2,
                minView:2,
                weekStart: 1,
                todayBtn:  1,
                autoclose: 1,
                todayHighlight: 1,
                forceParse: 0,
            });
        },15)
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
            tabActionAndTransactionModalsData(e) // inside only on td and input with get data
            
        }//key COde TAB
        
        if(e.key=="Enter" || e.keyCode == '13'){
            _sendTableModalDataToParent(e)
            _cloneRow(e)
            
        }// key code ENTER
        _filterOnModalData(e) //filter on data drop on if td/ input with get-data
        
        if(e.shiftKey && e.keyCode == 9) { 
            if (e.target.nodeName=='TD' && e.target.getAttribute("get-data")){
                if(e.target.isSameNode(e.target.parentNode.firstElementChild)){
                    e.target.innerHTML="" //make empty
                }
            }               
        }// back TAB (using shift)
        
        
        _validateAndMakeDateInLedgerRow(e);// needs all keys
        
        
    }//key up on content
    
    function actionOnMouseKey(e){
        //left mouse click
        if(e.button ==0) {
            _sendTableModalDataToParent(e)
            _removeTransactionRow(e)
            _cloneRow(e)
        } 
    }

    function _cloneRow(e) {
        if(e.target.className.includes("action-add-row") || e.target.matches(".action-add-row span") ){
            let parentEl = e.target.parentNode.parentNode
            if (parentEl.nodeName == "BUTTON") parentEl = parentEl.parentNode.parentNode;
            if(_isTransactionRowValid(parentEl)){
                let indexOfCurrRow = parentEl.id.split("-")[3]
                let cloneId = "business-tx-row-"+ (parseInt(indexOfCurrRow,10)+1)
                const{TRANSACTION_ROW_STRING} = require('./constants')
                // console.log("action add row clicked")
                if (document.getElementById(cloneId) == null || document.getElementById(cloneId) == undefined){
                    let currElTabIndex = e.target.tabIndex
                    var cloneRow  = _getTransactionRow(TRANSACTION_ROW_STRING)    
                    cloneRow.id = cloneId
                    cloneRow.firstElementChild.tabIndex = parseInt(currElTabIndex,10)+1
                    var table = document.getElementById("business-transaction-table"); // find table to append to
                    let tbody = table.querySelector("tbody")
    
                    tbody.appendChild(cloneRow); // append row to table
                }

            } // if transaction row valid
        }//if action-add button
    }// function cloneRow
    
    
    function _isTransactionRowValid(parentRow){
        let notificMsg =""
        let isValid = false
        if(! parentRow.querySelector("td.prod-name").innerHTML)
        {notificMsg += " Choose Product Name value;"}
        if(! parentRow.querySelector("td.prod-manufacturer").innerHTML)
        {notificMsg += " Choose Product Manufacturer ;"}
        if(! parentRow.querySelector("td.prod-variety").innerHTML )
        {notificMsg += " Choose Product variety ;"}
        if(! parentRow.querySelector("td.prod-qty").innerHTML )
        {notificMsg += " Enter valid product quantity; "}
        if(! parentRow.querySelector("td.prod-unit-price").innerHTML )
        {notificMsg += " Enter valid product unit price; "}
        else{
            isValid = true
        }
        if(notificMsg){
            new Notification("ERROR!",{body:notificMsg})
        }
        console.log("is row valid: ",isValid)
        return isValid
    }// function transaction Row Valid



    function _getTransactionRow(htmlStr){
        var tbody = document.createElement('tbody'); // create row node
        tbody.innerHTML = htmlStr.trim();
        return tbody.firstElementChild
    }

    function _removeTransactionRow(e){
        if (e.target.className.includes("action-remove-row") || e.target.matches(".action-remove-row span")){
            let rowNode = e.target.parentNode.parentNode
            if(rowNode.nodeName == "BUTTON") rowNode = rowNode.parentNode.parentNode
            if( !rowNode.isSameNode(rowNode.parentNode.firstElementChild)){
                document.querySelector("#business-transaction-table tbody").removeChild(rowNode)
            }else{ new Notification('ERROR!',{body:'Single row cannot be removed'})}
        }
    }

    function  _validateAndMakeDateInLedgerRow(e){
        if(e.target.className =="prod-qty"){
            if(isNaN(e.target.innerHTML)) e.target.innerHTML=""
        }
        
        if (e.target.className == "prod-unit-price"){
            if(isNaN(e.target.innerHTML)){
                e.target.innerHTML=""
            }else{
                let unitPriceVal = parseFloat(e.target.innerHTML)
                let parentRow = e.target.parentNode
                let qtyVal = parentRow.querySelector("td.prod-qty").innerHTML                
                if(qtyVal.length <= 0 || isNaN(qtyVal)){
                    new Notification('Error! Wrong Quantity',{body:'Quantity cannot be empty'})
                }else{
                    let totalEl = parentRow.querySelector("td.prod-total")
                    let result = unitPriceVal * parseInt(qtyVal,10)
                    if(!isNaN(result)) totalEl.innerHTML = result.toLocaleString()
                }
            }
        }// unit price in each row
    }// validate and produce ledger row data 
    
    
    
    let tdModalCondtionToFetchData = {}//global
    
    function tabActionAndTransactionModalsData(e){
        let that = e.currentTarget;
        if((e.target.nodeName =="TD" || e.target.nodeName =="INPUT") && (  e.target.getAttribute("get-data")) ){
            let currTabIndex = e.target.getAttribute("tabIndex")
            let tabIndexForModal = parseInt(currTabIndex)+1
            let tabIndexForSiblings = parseInt(currTabIndex)+3
            
            // pretext for data
            let colAttr = e.target.getAttribute("get-data")
            let table  = colAttr.split("-")[0]
            let tableColumnToFetch = colAttr.split("-")[1]
            var offset =  _offset(e.target)
            let targetWidth = e.target.offsetWidth
            if(e.target.id =="business-name"){
                e.target.parentNode.parentNode.nextElementSibling.querySelector('select').setAttribute("tabIndex",tabIndexForSiblings)
                let tableCols = e.currentTarget.querySelector("#business-transaction-table").querySelectorAll("TD,select,button")
                tableCols.forEach((td)=>{
                    td.setAttribute("tabIndex",tabIndexForSiblings)
                })
                tdModalCondtionToFetchData = {}
            }// if business name input
            
            if(e.target.nodeName =='TD'){
                let nextAllSiblings = $(e.target).nextAll()
                nextAllSiblings.attr("tabIndex",tabIndexForSiblings)// IMPORTANT! changing tabIndex for comings TDs
                nextAllSiblings.each((ev,item)=>{
                    // console.log(nextAllSiblings)
                    let attr = $(item).attr('no-tab');
                    let hasAttrNoTab = typeof attr !== typeof undefined && attr !== false ;
                    if($(item).find("select,input,button").length >0 || hasAttrNoTab ){
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
                    // console.log("first child")
                    tdModalCondtionToFetchData = {}
                }
            }// if table column
            
            // remove the class now
            if(that.querySelector(".active-modal")){
                that.querySelector(".active-modal").classList.remove("active-modal")
            }
            
            let data = {
                table:table,
                column:tableColumnToFetch,
                condition:tdModalCondtionToFetchData,
                tabIndex:tabIndexForModal
            }
            
            let modalOptions = {
                offset:offset,
                width:targetWidth,
            }
            // tabIndex:tabIndexForModal
            
            
            e.target.classList.add("active-modal")
            ipc.send("setTransactionModalData",data)
            
            setTimeout(() => {
                showTableColumnModal(modalOptions,targetWidth)
            }, 15); 
            
            
        } // get-data attribute
        
        
    }// function
    
    function _sendTableModalDataToParent(e){
        if(e.target.className == "table-modal-content" || e.target.parentNode.className =="table-modal-content"){
            let parentToModal = document.querySelector(".active-modal")
            let currTabIndex = parentToModal.getAttribute("tabIndex")
            let nextNonModalTabIndex = parseInt(currTabIndex)+3
            if(parentToModal.tagName =='INPUT'){
                parentToModal.value = e.target.innerText
            }else{
                parentToModal.innerHTML = e.target.innerText
                parentToModal.setAttribute("data-set","true")
                // parentToModal.nextElementSibling.focus()
            }
            document.querySelector("[tabIndex='"+nextNonModalTabIndex+"']").focus()
            if (e.target.className == "table-modal-content") e.target.parentNode.style.display = "none"
            if (e.target.parentNode.className =="table-modal-content") e.target.parentNode.parentNode.style.display = "none"
        }
    }
    
    function showTableColumnModal(modalOptions){
        var modalEl = document.getElementById("bt-modal-on-table-column")
        modalEl.style.top = (modalOptions.offset.bottom+5)+"px"
        modalEl.style.left = (modalOptions.offset.left)+"px"
        modalEl.style.width = (modalOptions.width+20)+"px"
        modalEl.style.display = "block"
    }
    
    
    function _filterOnModalData(e){
        if((e.target.nodeName=='TD' || e.target.nodeName =='INPUT') && (e.target.getAttribute("get-data"))){
            let value = (e.target.nodeName=='TD')? $(e.target).text().toLowerCase(): $(e.target).val().toLowerCase();
            var $items = $("#bt-modal-on-table-column div b")
            var $filter = $items.filter(function() {
                // $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                return $(this).text().toLowerCase().indexOf(value) > -1
            })
            var $nonFiltered = $items.not($filter)
            console.log("elements found, ",$filter.length) 
            
            $nonFiltered.each(function(){$(this).parent().attr("tabIndex","-1")})//remove tabs from non matching
            
            setTimeout(() => {
                $items.toggle(false)
                $filter.toggle(true)
            }, 10);
            
            if($filter.length == 0){
                const { dialog } = require('electron').remote
                let objectStr;
                let filename;
                if (e.target.id =="business-name") {objectStr="Business"; filename = "add-business-form.html"}
                if (e.target.nodeName =="TD"){objectStr="Product"; filename = "add-product-form.html"}
                
                dialog.showMessageBox({
                    type:"question",
                    title:"No "+objectStr+" Found",
                    message:"Do you want to add this new "+objectStr+"?",
                    buttons:['Cancel', 'Yes, please']
                }).then((val)=>{
                    if(val.response == 1){
                        my_html_magic_lib.showAddModal(filename)
                    }
                })
            }// if filter no match
        }// if filter is a td or input with fet data
    }// function
    
    
    function _offset(el) {
        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { bottom: rect.bottom + scrollTop, left: rect.left + scrollLeft }
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
        actionOnTransactionModals: tabActionAndTransactionModalsData,
        showAddModal:showAddModal,
        actionOnMouseKey:actionOnMouseKey
        
    }
})();

module.exports = my_html_magic_lib;