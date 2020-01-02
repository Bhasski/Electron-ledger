var my_html_magic_lib = my_html_magic_lib || (function(){
    var ipc  = require('electron').ipcRenderer
    

    function _saveObject(data,myCallback){
        ipc.send('saveObject',data);
        setTimeout(() => {if(myCallback) myCallback()}, 10);
    }


    function doActionsOnContentOnClick(e,isSetUpNeeded){
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
        
        // ---------------- click part if transaction file is there -----------------
        if(e.target.matches("input#cash-switch")){
            if(e.target.checked){
                document.querySelectorAll(".summary-cash-row").forEach((row)=>{
                    _fadeIn(row,"flex")
                    _actionOnCashCol(e)
                })
            }else{
                document.querySelectorAll(".summary-cash-row").forEach((row)=>{
                    row.style.display="none"
                    _removeTabIndexToCashCol()
                })
            }
        }// if cash switch in transaction page


    }// function for click action on content box
    
    

    function _fadeIn(element,displayString) {
        var op = 0.1;  // initial opacity
        element.style.opacity = op;
        element.style.display = (displayString)?displayString:"block";
        var timer = setInterval(function () {
            if (op >= 1){
                clearInterval(timer);
            }
            element.style.opacity = op;
            // element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += op * 0.1;
        }, 10);
    }

    function _actionOnCashCol(e){
        let that = e.currentTarget
        let lastRowFirstCol = document.querySelector("#business-transaction-table tr:last-child td:first-child")
        
        // tabIndex Logic from main function
        let tabIndex = lastRowFirstCol.getAttribute("tabIndex")
        let tabIndexForSiblings = parseInt(tabIndex,10)+3
        let tabIndexForCashCol = tabIndexForSiblings+2

        let businessInput = that.querySelector("#business-name")
        
        let cashCol = document.querySelector("#ledger-summary-box .gross-cash")
        cashCol.setAttribute("tabIndex",tabIndexForCashCol)
        setTimeout(() => {
            if(!businessInput.value) businessInput.focus()
            if(businessInput.value) lastRowFirstCol.focus()
            
        }, 100);
    }

    function _removeTabIndexToCashCol(){
        document.querySelector("#ledger-summary-box .gross-cash").setAttribute("tabIndex","-1")
    }

    function showAddModal(filePath){ // add Product or Business or Master
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
            // tabActionAndTransactionModalsData(e) // inside only on td and input with get data
            
        }//key COde TAB
        
        if(e.key=="Enter" || e.keyCode == '13'){
            _sendTableModalDataToParent(e)
            _cloneRow(e)
            
        }// key code ENTER
        
        if(e.shiftKey && e.keyCode == 9) { 
        
        }// back TAB (using shift)
        
        
        _filterOnModalData(e) //filter on data drop on if td/ input with get-data
        
        if (document.querySelector(".tab-pane#business").contains(e.target)){
            _validateAndCalcAmountForRow(e);// needs all keys
            _calcAndShowGrossAmount(e)// on unit price
        }
        
    }//key up on content
    
    
    

    function actionOnMouseKey(e){
        //left mouse click
        if(e.button ==0) {
            _sendTableModalDataToParent(e)
            _removeTransactionRow(e)
            _cloneRow(e)
            _hideModalOnNonParentClick(e)

        } 
    }// mouse click 

    
    function _hideModalOnNonParentClick(e){
        if( !e.target.getAttribute("get-data") ){
            modalEl_1 = document.getElementById("bt-modal-on-table-column")
            if (modalEl_1) modalEl_1.style.display = "none"
        }
    }

    function _calcAndShowGrossAmount(e){
        if(e.target.className.includes("prod-unit-price") || e.target.className.includes("prod-qty") ){
            setTimeout(() => {
                let gross_item_count = 0
                let gross_amount = 0
                let allColsWithAmount = document.querySelectorAll("table#business-transaction-table td.prod-total")
                allColsWithAmount.forEach((col)=>{
                    if(col.innerHTML){
                        // console.log( "original: ",col.innerHTML,"parse: ",Number(col.innerHTML.trim()))
                        gross_amount += parseFloat(col.innerHTML)
                        gross_item_count += 1
                    }
                })
                document.querySelector("div#ledger-summary-box .gross-amount").innerHTML = gross_amount.toLocaleString("hi")
                document.querySelector("div#ledger-summary-box .gross-count-items").innerHTML = gross_item_count
                
            }, 100);
        }// end if product-unit-price
        if(e.target.className.includes("gross-cash")){
            if(isNaN(e.target.innerHTML)){
                e.target.innerHTML = ""
            }else{
                let gross_amount = document.querySelector("div#ledger-summary-box .gross-amount").innerHTML
                gross_amount = parseFloat(gross_amount.replace(/\,/g,''))
                let gross_remEL = document.querySelector("div#ledger-summary-box .gross-remaining")
                gross_remEL.innerHTML = (gross_amount - parseFloat(e.target.innerHTML)).toLocaleString("hi")
            }
        } 
    }

    function _cloneRow(e) {
        if(e.target.className.includes("action-add-row") || e.target.matches(".action-add-row span") ){
            let parentCol = e.target.parentNode
            if (parentCol.nodeName == "SMALL") parentCol = parentCol.parentNode.parentNode;
            if(_isValidValueForRow(parentCol)){
                let parentRow = parentCol.parentNode
                let indexOfCurrRow = parentRow.id.split("-")[3]
                let cloneId = "business-tx-row-"+ (parseInt(indexOfCurrRow,10)+1)
                const{TRANSACTION_ROW_STRING} = require('./constants')
                // clone row
                if (document.getElementById(cloneId) == null || document.getElementById(cloneId) == undefined){
                    let currElTabIndex = e.target.tabIndex
                    var cloneRow  = _getTransactionRow(TRANSACTION_ROW_STRING)    
                    cloneRow.id = cloneId
                    // cloneRow.firstElementChild.tabIndex = parseInt(currElTabIndex,10)+1
                    let cloneRowCols = cloneRow.querySelectorAll("td,select,button")
                    cloneRowCols.forEach((col)=>{
                        col.tabIndex = parseInt(currElTabIndex,10)+1
                    })
                    var table = document.getElementById("business-transaction-table"); // find table to append to
                    let tbody = table.querySelector("tbody")
    
                    tbody.appendChild(cloneRow); // append row to table
                    cloneRow.querySelector("td:first-child").focus()
                }

            } // if transaction row valid
        }//if action-add button
    }// function cloneRow
    

    function _isValidValueForRow(elem){
        
        let prvElemToCheck = (elem.nodeName == 'TD')? elem.previousElementSibling : elem.parentNode.previousElementSibling
        if (prvElemToCheck && prvElemToCheck.nodeName == 'TD'){
            if ( prvElemToCheck.childNodes.length>0 || prvElemToCheck.innerHTML){// has value in previous
                 return _isValidValueForRow(prvElemToCheck)
            }else{  //previous element empty
                if(prvElemToCheck.className.includes("prod-total")){
                    _isValidValueForRow(prvElemToCheck)// prod-total can be emp, but check for previous
                }else{
                    _showNotificationForEmptyValue(prvElemToCheck)
                    console.log("before focusing on previous elem: ", prvElemToCheck)
                    prvElemToCheck.focus()
                    return false;
                }
            } 
        }else{
            return true
        }
    }



    function _getTransactionRow(htmlStr){
        var tbody = document.createElement('tbody'); // create row node
        tbody.innerHTML = htmlStr.trim();
        return tbody.firstElementChild
    }

    function _removeTransactionRow(e){
        if (e.target.className.includes("action-remove-row") || e.target.matches(".action-remove-row span")){
            let rowNode = e.target.parentNode.parentNode
            if(rowNode.nodeName == "BUTTON") rowNode = rowNode.parentNode.parentNode
            if(rowNode.parentNode.querySelectorAll("tr").length >1){
                document.querySelector("#business-transaction-table tbody").removeChild(rowNode)
            }else{ new Notification('ERROR!',{body:'Single row cannot be removed'})}
        }
    }

    

    function  _validateAndCalcAmountForRow(e){
        if(_isValidValueForRow(e.target)){
            let parentEl = e.target.parentNode
            if (parentEl.nodeName =='TD') parentEl = parentEl.parentNode
            if(!parentEl.firstElementChild.innerHTML){
                parentEl.querySelector("td.prod-manufacturer").innerHTML=""
                parentEl.querySelector("td.prod-variety").innerHTML=""
            }

            if(e.target.className =="prod-qty"){
                if(isNaN(e.target.innerHTML)) e.target.innerHTML=""
                
                let parentRow = e.target.parentNode
                let totalEL = parentRow.querySelector("td.prod-total")
                if(e.target.innerHTML){
                    let unitPriceVal = parentRow.querySelector("td.prod-unit-price").innerHTML
                    if(unitPriceVal){
                        totalEL.innerHTML = parseFloat(e.target.innerHTML) * parseFloat(unitPriceVal)
                    }
                }else{
                    totalEL.innerHTML = ""
                }
            }

            if (e.target.className == "prod-unit-price" ){
                if(isNaN(e.target.innerHTML)  ){
                    e.target.innerHTML=""
                }else{
                    let parentRow = e.target.parentNode
                    let totalEl = parentRow.querySelector("td.prod-total")
                    let unitPriceVal = e.target.innerHTML
                    if(unitPriceVal){ // found unit price value
                        unitPriceVal = parseFloat(unitPriceVal)
                        let qtyVal = parentRow.querySelector("td.prod-qty").innerHTML                
                        if(qtyVal.length <= 0 || isNaN(qtyVal)){
                            // new Notification('Error! Wrong Quantity',{body:'Quantity cannot be empty'})
                        }else{
                            let result = unitPriceVal * parseInt(qtyVal,10)
                            if(!isNaN(result)) totalEl.innerHTML = result
                        }
                    }else{ // no unit price val
                        totalEl.innerHTML=""
                    }
                }
            }//end if  unit price TD actions

        }else{ //not valid target 
            if(e.target.getAttribute("contenteditable"))
            e.target.innerHTML = ""
            
        } 
        
    }//  function validate and produce ledger row data 
    
 
    function _showNotificationForEmptyValue(elem){
        let notificMsg =""
        if (elem.nodeName =='TD'){
            if( elem.className.includes("prod-name"))
            {notificMsg += " Choose Product Name value;"}
            if( elem.className.includes("prod-manufacturer"))
            {notificMsg += " Choose Product Manufacturer ;"}
            if( elem.className.includes("prod-variety") )
            {notificMsg += " Choose Product variety ;"}
            if( elem.className.includes("prod-qty"))
            {notificMsg += " Enter valid product quantity; "}
            if( elem.className.includes("prod-unit-price"))
            {notificMsg += " Enter valid product unit price; "}
            if( elem.className.includes("prod-total"))
            {notificMsg += " Data Not Valid; "}

        }
        if(notificMsg){
            new Notification("ERROR!",{body:notificMsg})
        }

    }


    
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
                let parentAtColLevel = e.target.parentNode.parentNode 
                parentAtColLevel.nextElementSibling.querySelector('select').setAttribute("tabIndex",tabIndexForSiblings)
                let tableEls =  document.querySelectorAll("tr:first-child td:first-child,tr:first-child select,tr:first-child button")
                tableEls.forEach((element)=>{
                    // console.log(element)
                    element.setAttribute("tabIndex",tabIndexForSiblings)
                })

                tdModalCondtionToFetchData = {}
            }// if business name input
            
            if(e.target.nodeName =='TD'){
                let nextAllSiblings = $(e.target).nextAll()
                nextAllSiblings.attr("tabIndex",tabIndexForSiblings)// IMPORTANT! changing tabIndex for comings TDs
                nextAllSiblings.each((ev,tableCol)=>{
                    let noTabAttrVal = $(tableCol).attr('no-tab');
                    let hasAttrNoTab = typeof noTabAttrVal !== typeof undefined && noTabAttrVal !== false ;
                    // console.log(tableCol," attribute: "+hasAttrNoTab)
                    if($(tableCol).find("select,input,button").length >0 || hasAttrNoTab ){
                        $(tableCol).attr("tabIndex","-1")   
                        $(tableCol).find("select,input,button").attr("tabIndex",tabIndexForSiblings)
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
            }// if table column
            
            // any get-data Elem
            let grossCashCol = document.querySelector("#ledger-summary-box .gross-cash") ;
            if(grossCashCol.style.display !="none"){
                grossCashCol.setAttribute("tabIndex",(tabIndexForSiblings+2))
            }
            let actionBtn = document.querySelector(".transaction-action-box button.save-transaction-btn")
            actionBtn.setAttribute("tabIndex",(tabIndexForSiblings+3)) // SAVE BTN Made TabIndex Max


            // remove the active class now
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
            data.modalOptions = modalOptions;
            
            e.target.classList.add("active-modal")
            ipc.send("setTransactionModalData",data)
            
            
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
            let value = (e.target.nodeName=='TD')? $(e.target).text().trim().toLowerCase(): $(e.target).val().trim().toLowerCase();
            var $items = $("#bt-modal-on-table-column div b")
            var $filter = $items.filter(function() {
                // $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                return $(this).text().trim().toLowerCase().indexOf(value) > -1
            })
            var $nonFiltered = $items.not($filter)
            // console.log("elements found, ",$filter.length) 
            
            $nonFiltered.each(function(){$(this).parent().attr("tabIndex","-1")})//remove tabs from non matching
            
            setTimeout(() => {
                $items.toggle(false)
                $filter.toggle(true)
            }, 10);
            
            if($filter.length == 0){
                if(e.keyCode && e.keyCode!= 8){
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
                            showAddModal(filename)
                            showDatepicker()
                        }
                    })
                }// dialog when no backspace
              
            }// if filter no matched elements
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
        doActionOnContentOnClick: doActionsOnContentOnClick,
        hideActiveTabPane: hideActiveTabPane,
        makeTabActive: tabBtnAndContentActiveState,
        sendTableForRecordBox: sendTableForRecordBox,
        actionOnTableModalKeyUp: actionOnTableModalKeyUp,
        actionOnTransactionModals: tabActionAndTransactionModalsData,
        showAddModal:showAddModal,
        actionOnMouseKey:actionOnMouseKey,
        showTableColumnModal:showTableColumnModal
        
    }
})();

module.exports = my_html_magic_lib;