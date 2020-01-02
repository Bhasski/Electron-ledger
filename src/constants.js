var db_struct = {
    tables:{
        LedgerMaster:{
            id:'master_id',
            name:'master_name',
            proprietor:'master_proprietor',
            address:'master_address',
            email:'master_email',
            phone:'master_phone'
            
        },
        Product:{
            id:'p_id',
            name:'p_name',
            dom:'p_dom',
            doe:'p_doe',
            manufacturer:'p_manufacturer',
            variety:'p_variety'
        },Business:{
            id:'b_id',
            name:'b_name',
            address:'b_address',
            phone:'b_phone',
            email:'b_email',
            proprietor:'b_proprietor'
        }
        
    },
    TRANSACTION_ROW_STRING: "<tr id='business-tx-row'>"+
    "<td tabIndex='0' contenteditable='true' class='prod-name' get-data='Product-name'></td>"+
    "<td tabIndex='0' contenteditable='false' class='prod-manufacturer' get-data='Product-manufacturer'></td>"+
    "<td tabIndex='0' contenteditable='false' class ='prod-variety' get-data='Product-variety'></td>"+
    "<td tabIndex='0' contenteditable='true' class='prod-qty' data-text='Quantity'></td>"+
    "<td><select name='' id='prod_qty' class='prod-unit'>"+
            "<option value='unit'>unit(s)</option>"+
            "<option value='gm'>g(s)</option>"+
            "<option value='kg'>Kg(s)</option>"+
            "<option value='bag'>Bag(s)</option>"+
            "<option value='ctn'>Carton(s)</option>"+
        "</select></td>"+
    "<td tabIndex='0' contenteditable='true' class='prod-unit-price' data-text='Price' ></td>"+
    "<td tabIndex='-1' no-tab contenteditable='false' class='prod-total' data-text='Total'></td>"+
    "<td tabIndex='0' no-tab>"+
    "<button class='btn btn-xs btn-default action-add-row'><small><span class='glyphicon glyphicon-plus'></span></small></button>"+
    "<button class='btn btn-xs btn-danger action-remove-row' data-toggle='tooltip' title='Only mouse click allowed' >"+
    "<small><span class='glyphicon glyphicon-minus'></span></small></button>"+
    "</td></tr>"
    
    
    
} 

module.exports = db_struct;