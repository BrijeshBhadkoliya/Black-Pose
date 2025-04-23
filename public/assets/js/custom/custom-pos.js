/*
-----------------------------------
    : Custom - Flot Charts js :
-----------------------------------
*/
"use strict";

    
$(document).on('change', '#poscat', function(){
    var cat = this.value;
    var baseUrl = window.location.origin;
    
    if(cat == "all"){
    window.location.href=baseUrl+"/user/pos"   // get require
    }else{
    window.location.href=baseUrl+"/user/srchcat/"+ cat; 
       }
})

function serchItem(item) {
    const baseUrl = window.location.origin;
    const serch_product = item.toLowerCase(); 
    
    $.ajax({
        type: 'get',
        url: baseUrl + "/user/productList",
        dataType: 'json',
        success: function(res) {
            const product = res.data.filter((pro) => {
                return pro.Name?.toLowerCase().includes(serch_product) || 
                       pro.proCode?.toLowerCase().includes(serch_product);
            });

            $('#product_list').html(''); // Clear existing

            if (product.length > 0) {
                $.each(product, function(index, value) {
                    let originalPrice = value.sellingPrice || 0;
                    let discount = value.discount || 0;
                    let finalPrice = originalPrice;

                    if (value.discountType === "percent") {
                        finalPrice = (originalPrice - (originalPrice * discount / 100)).toFixed(1);
                    } else {
                        finalPrice = (originalPrice - discount).toFixed(0);
                    }

                    let data, maindata;

                    if (value.Currency_placement == 1) {
                        data = ` ${value.Currency}${originalPrice} `;
                        maindata = `${value.Currency} ${finalPrice} `;
                    } else {
                        data = `${value.Currency}${originalPrice}`;
                        maindata = `${value.Currency} ${finalPrice}`;
                    }

                    $('#product_list').append(
                        `<div class="col-xl-4 col-md-6 col-sm-12 m-b-20 p-2">
                            <form id="${value._id}" class="mb-2">
                                <div class="media">
                                    <img class="align-self-center rounded-circle" width="70px" height="70px" src="/uploads/resized/${value.productImage}" />
                                    <div class="media-body ml-3">
                                        <h6 class="mb-2">${value.Name}</h6>
                                        <p>code: ${value.proCode}</p>
                                        <p class="font-15 symbol"><span>${maindata}</span>&nbsp;<span><small><del>${data}</del></small></span></p>
                                        <button class="btn btn-round btn-primary-rgba" data-id="${value._id}" id="add_prod">
                                            <i class="dripicons-basket font-15"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>`
                    );
                });
            } else {
                $('#product_list').html('<p>No matching products found.</p>');
            }
        }
    });
}



$(document).on('keyup',"#srcpro", function(){
    var item = document.getElementById('srcpro').value
    
    serchItem(item)
    
})



function addtocart(prod_id){
    
    event.preventDefault()
    var productId = prod_id;
    var cousId = document.getElementById('cust').value
    var baseUrl = window.location.origin;
    var serch_product = 0
    $.ajax({
        type:'post',
        url: baseUrl+"/user/addCart",
        data:{
            id :productId,
            coust_id:cousId
            },
        dataType: 'json',
        success:function(res){
            
            if(res.success){
                toastr["success"](res.success);
            }
            if(res.error){
                toastr["error"](res.error);
            }


            
            if (res.data.Currency_placement == 1) {  

                var SubTotal = res.data.SubTotal + " " + res.data.Currency
                var Productdiscount = res.data.Productdiscount + " " + res.data.Currency
                var Coupondiscount = res.data.Coupondiscount + " " + res.data.Currency
                var Tax = res.data.Tax + " " + res.data.Currency
                var Amount = res.data.Amount + " " + res.data.Currency
            } else {

                var SubTotal = res.data.Currency + " " + res.data.SubTotal
                var Productdiscount = res.data.Currency + " " + res.data.Productdiscount
                var Coupondiscount = res.data.Currency + " " + res.data.Coupondiscount
                var Tax = res.data.Currency + " " + res.data.Tax
                var Amount = res.data.Currency + " " + res.data.Amount
            }

            $('#cart_item').html('')
            $.each(res.data.item, function(index, value){
            $('#cart_item').append(   '<tr class="text-center" > ' +
                                                '<td>'+value.productName+'</td>'+
                                            ' <td>'+
                                                ' <div class="form-group mb-0">'+
                                                    '<input type="number" class="form-control cart-qty" name="cartQty1" id="cartQty1" min="1" value="'+value.productCount+'" data-name="'+value.productName+'" data-id="'+value._id+'"> ' +   
                                                '</div>'+
                                            ' </td>'+
                                                '<td>'+value.productPrice+'</td>'+
                                            ' <td class="symbol">'+value.discount+'</td>'+
                                            ' <td class="symbol">'+value.tax+'</td>'+ 
                                            ' <td class="symbol">'+value.total+'</td>'+
                                                '<td><button  type="button" class="btn btn-round btn-danger-rgba" id="del_cart_item" value="'+value._id+'"><i class="feather icon-trash-2"></i></button></td>'+
                                        ' </tr>');
            $('#Cart_total').html('');
            $('#Cart_total').html('<tr>'+
                                        '<td>Sub Total :</td>'+
                                    ' <td class="symbol">'+ SubTotal +' </td>'+
                                ' </tr>'+
                                ' <tr>'+
                                    ' <td>Product discount :</td>'+
                                    ' <td class="symbol">'+ Productdiscount +' </td>'+
                                ' </tr>'+
                                ' <tr>'+
                                        '<td>Coupon discount :</td>'+
                                        '<td class="symbol">'+ Coupondiscount +' </td>'+
                                    '</tr>'+
                                ' <tr>'+
                                        '<td>Tax :</td>'+
                                    '  <td class="symbol">'+ Tax +' </td>'+
                                '    </tr>'+
                                ' <tr>'+
                                    ' <td class="f-w-7 font-18"><h4>Amount :</h4></td>'+
                                    '  <td class="f-w-7 font-18 symbol"><h4>'+ Amount +' </h4></td>'+
                                    '</tr>')
            })
            checkCoupon(res)
        }
    })
}


$(document).on("click",'#add_prod', function(){

    var id = $(this).attr('data-id');
   

    addtocart(id); // This function add a select when another select is clicked

    // Some others functions ...
    });









$(document).on('change','#cust', function()
{    var id = this.value;
    var baseUrl = window.location.origin;
    $.ajax({
        type:'post',
        url:baseUrl+"/user/userId",
        data:{
            userId: id
        },
        dataType:'json',
        success:function(res){
            $('#curr_cus').html('<h5 id="curr_cus">Current Customer <br><span class="text-lg-center text-info"> ' +res.coust_name +'</span></h5>');   
        }
    })
});

function updateQuntity(id, prodName, quntity)
{   event.preventDefault()
    
    var quntity = quntity
    var id = id
    var proName = prodName
    var baseUrl = window.location.origin;
   
    if(quntity < 1){
        toastr["error"]("Quntity are not less then 1");
    }else{
    
        $.ajax({
            type:'post',
            url: baseUrl+"/user/quntity",
            data:{
                    quntity:quntity,
                    id:id,
                    proName:proName
                },
            dataType: 'json',
            success:function(res){
                if(res.success){
                toastr["success"](res.success);
                }
                if(res.error){
                    toastr["error"](res.error);
                }


                if (res.data.Currency_placement == 1) {  

                    var SubTotal = res.data.SubTotal + " " + res.data.Currency
                    var Productdiscount = res.data.Productdiscount + " " + res.data.Currency
                    var Coupondiscount = res.data.Coupondiscount + " " + res.data.Currency
                    var Tax = res.data.Tax + " " + res.data.Currency
                    var Amount = res.data.Amount + " " + res.data.Currency
                } else {
    
                    var SubTotal = res.data.Currency + " " + res.data.SubTotal
                    var Productdiscount = res.data.Currency + " " + res.data.Productdiscount
                    var Coupondiscount = res.data.Currency + " " + res.data.Coupondiscount
                    var Tax = res.data.Currency + " " + res.data.Tax
                    var Amount = res.data.Currency + " " + res.data.Amount
                }


                $('#cart_item').html('')
                $.each(res.data.item, function(index, value){

                $('#cart_item').append(   '<tr class="text-center" > ' +
                                                    '<td>'+value.productName+'</td>'+
                                                ' <td>'+
                                                   ' <div class="form-group mb-0">'+
                                                       ' <input type="number" class="form-control cart-qty" name="cartQty1" id="cartQty1" min="1" value="'+value.productCount+'" data-name="'+value.productName+'" data-id="'+value._id+'" > '+    
                                                  '  </div>'+
                                                  
                                                ' </td>'+
                                                    '<td>'+value.productPrice+'</td>'+
                                                ' <td >'+value.discount+'</td>'+
                                                ' <td >'+value.tax+'</td>'+ 
                                                ' <td >'+value.total+'</td>'+
                                                    '<td><button  type="button" class="btn btn-round btn-danger-rgba" id="del_cart_item" value="'+value._id+'"><i class="feather icon-trash-2"></i></button></td>'+
                                            ' </tr>');
                $('#Cart_total').html('');
                $('#Cart_total').html('<tr>'+
                                            '<td>Sub Total :</td>'+
                                        ' <td>'+ SubTotal +' </td>'+
                                    ' </tr>'+
                                    ' <tr>'+
                                        ' <td>Product discount :</td>'+
                                        ' <td>'+ Productdiscount +' </td>'+
                                    ' </tr>'+
                                    ' <tr>'+
                                            '<td>Coupon discount :</td>'+
                                            '<td>'+ Coupondiscount +'</td>'+
                                        '</tr>'+
                                    ' <tr>'+
                                            '<td>Tax :</td>'+
                                        '  <td>'+ Tax +' </td>'+
                                    '    </tr>'+
                                    ' <tr>'+
                                        ' <td class="f-w-7 font-18"><h4>Amount :</h4></td>'+
                                        '  <td class="f-w-7 font-18"><h4>'+ Amount +' </h4></td>'+
                                        '</tr>')
                })
                checkCoupon(res)
            }
        })
    }
};

$(document).on("change",'.cart-qty', function(){

     var id = $(this).attr('data-id');
     var name = $(this).attr('data-name');
     
    updateQuntity(id,name,this.value); // This function add a select when another select is clicked

// Some others functions ...
});

$(document).on('change','#specialNotes', function()
{   
    var note = this.value;
    var baseUrl = window.location.origin;
    $.ajax({
        type:'post',
        url:baseUrl+"/user/note",
        data:{
            note:note
        },
        dataType:'json',
        success:function(res){
            toastr.success(res.success)
        }
    })
})

function deletitem(item_id){
    event.preventDefault()
    var id = item_id
    var baseUrl = window.location.origin;
    $.ajax({
        type:'get',
        url: baseUrl+"/user/deletitem/"+id,
        success:function(res){
            if(res.success){
                toastr["success"](res.success);
            }
            if(res.error){
                toastr["error"](res.error);
            }

            if (res.data.Currency_placement == 1) {  

                var SubTotal = res.data.SubTotal + " " + res.data.Currency
                var Productdiscount = res.data.Productdiscount + " " + res.data.Currency
                var Coupondiscount = res.data.Coupondiscount + " " + res.data.Currency
                var Tax = res.data.Tax + " " + res.data.Currency
                var Amount = res.data.Amount + " " + res.data.Currency
            } else {

                var SubTotal = res.data.Currency + " " + res.data.SubTotal
                var Productdiscount = res.data.Currency + " " + res.data.Productdiscount
                var Coupondiscount = res.data.Currency + " " + res.data.Coupondiscount
                var Tax = res.data.Currency + " " + res.data.Tax
                var Amount = res.data.Currency + " " + res.data.Amount
            }


            $('#cart_item').html('')
            $.each(res.data.item, function(index, value){
            $('#cart_item').append(   '<tr class="text-center" > ' +
                                                '<td>'+value.productName+'</td>'+
                                            ' <td>'+
                                                ' <div class="form-group mb-0">'+
                                                    '<input type="number" class="form-control cart-qty" name="cartQty1" id="cartQty1" min="1" value="'+value.productCount+'" data-id="'+value._id+'" data-name="'+value.productName+'"> ' +   
                                                '</div>'+
                                            ' </td>'+
                                                '<td>'+value.productPrice+'</td>'+
                                            ' <td >'+value.discount+'</td>'+
                                            ' <td >'+value.tax+'</td>'+ 
                                            ' <td >'+value.total+'</td>'+
                                                '<td><button  type="button" class="btn btn-round btn-danger-rgba" id="del_cart_item" value="'+value._id+'"><i class="feather icon-trash-2"></i></button></td>'+
                                        ' </tr>');
            })
            $('#Cart_total').html('')
            $('#Cart_total').html('<tr>'+
                                        '<td>Sub Total :</td>'+
                                    ' <td>'+ SubTotal +' </td>'+
                                ' </tr>'+
                                ' <tr>'+
                                    ' <td>Product discount :</td>'+
                                    ' <td>'+ Productdiscount +' </td>'+
                                ' </tr>'+
                                ' <tr>'+
                                        '<td>Coupon discount :</td>'+
                                        '<td>'+ Coupondiscount +' </td>'+
                                    '</tr>'+
                                ' <tr>'+
                                        '<td>Tax :</td>'+
                                    '  <td>'+ Tax +' </td>'+
                                '    </tr>'+
                                ' <tr>'+
                                    ' <td class="f-w-7 font-18"><h4>Amount :</h4></td>'+
                                    '  <td class="f-w-7 font-18"><h4>'+ Amount +' </h4></td>'+
                                    '</tr>')
          
                                    checkCoupon(res)
        }
    })
}
// delet cart item function
$(document).on('click', '#del_cart_item', function(){
    var id = this.value;
    deletitem(id)

})

$(document).on('click', '#button-addonTags', function(event){
    event.preventDefault();
    var baseUrl = window.location.origin;
    var coupon = document.getElementById('coupon').value;
    document.getElementById('coupon').value = '';

    $.ajax({
        type: 'POST',
        url: baseUrl + "/user/coupon",
        data: {
            code: coupon
        },
        dataType: 'json',
        success: function(res){
            if (res.success) {
                toastr["success"](res.success);
            }
            if (res.error) {
                toastr["error"](res.error);
            }

            // Toggle the "Remove Coupon" button visibility
            if (res.success) {
                // Show "Remove Coupon" button if coupon is applied successfully or there's an error
                $('#formcopupons').addClass('d-none')
                $('#removecupon').removeClass('d-none');
            }

            if (res.data.Currency_placement == 1) {
                var SubTotal = res.data.SubTotal + " " + res.data.Currency;
                var Productdiscount = res.data.Productdiscount + " " + res.data.Currency;
                var Coupondiscount = res.data.Coupondiscount + " " + res.data.Currency;
                var Tax = res.data.Tax + " " + res.data.Currency;
                var Amount = res.data.Amount + " " + res.data.Currency;
            } else {
                var SubTotal = res.data.Currency + " " + res.data.SubTotal;
                var Productdiscount = res.data.Currency + " " + res.data.Productdiscount;
                var Coupondiscount = res.data.Currency + " " + res.data.Coupondiscount;
                var Tax = res.data.Currency + " " + res.data.Tax;
                var Amount = res.data.Currency + " " + res.data.Amount;
            }

            $('#Cart_total').html('');
            $('#Cart_total').html('<tr>' +
                                    '<td>Sub Total :</td>' +
                                    '<td>' + SubTotal + ' </td>' +
                                    '</tr>' +
                                    '<tr>' +
                                    '<td>Product discount :</td>' +
                                    '<td>' + Productdiscount + ' </td>' +
                                    '</tr>' +
                                    '<tr>' +
                                    '<td>Coupon discount :</td>' +
                                    '<td>' + Coupondiscount + ' </td>' +
                                    '</tr>' +
                                    '<tr>' +
                                    '<td>Tax :</td>' +
                                    '<td>' + Tax + ' </td>' +
                                    '</tr>' +
                                    '<tr>' +
                                    '<td class="f-w-7 font-18"><h4>Amount :</h4></td>' +
                                    '<td class="f-w-7 font-18"><h4>' + Amount + ' </h4></td>' +
                                    '</tr>');
        }
    });
});

$(document).on('click', '#removecupon', function (event) {
    event.preventDefault();
    var baseUrl = window.location.origin;

    $.ajax({
        type: 'GET',
        url: baseUrl + '/user/removecoupon',
        dataType: 'json',
        success: function (res) {
            if (res.success) {
                toastr["success"](res.success);
            }
            if (res.error) {
                toastr["error"](res.error);
            }

            // Hide "Remove Coupon" button
            $('#removecupon').addClass('d-none');
            $('#formcopupons').removeClass('d-none')
            // Refresh cart totals dynamically
            if (res.data.Currency_placement == 1) {
                var SubTotal = res.data.SubTotal + " " + res.data.Currency;
                var Productdiscount = res.data.Productdiscount + " " + res.data.Currency;
                var Coupondiscount = res.data.Coupondiscount + " " + res.data.Currency;
                var Tax = res.data.Tax + " " + res.data.Currency;
                var Amount = res.data.Amount + " " + res.data.Currency;
            } else {
                var SubTotal = res.data.Currency + " " + res.data.SubTotal;
                var Productdiscount = res.data.Currency + " " + res.data.Productdiscount;
                var Coupondiscount = res.data.Currency + " " + res.data.Coupondiscount; 
                var Tax = res.data.Currency + " " + res.data.Tax;
                var Amount = res.data.Currency + " " + res.data.Amount;
            }

            $('#Cart_total').html('');
            $('#Cart_total').html('<tr>' +
                '<td>Sub Total :</td>' +
                '<td>' + SubTotal + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td>Product discount :</td>' +
                '<td>' + Productdiscount + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td>Coupon discount :</td>' +
                '<td>' + Coupondiscount + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td>Tax :</td>' +
                '<td>' + Tax + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="f-w-7 font-18"><h4>Amount :</h4></td>' +
                '<td class="f-w-7 font-18"><h4>' + Amount + '</h4></td>' +
                '</tr>');
        }
    });
});

function checkCoupon(res) {
    if (res.data.Coupondiscount === 0 && (!res.data.couponCode || res.data.couponCode.trim() === '')) {
        $('#removecupon').addClass('d-none');
        $('#formcopupons').removeClass('d-none');
    } else {
        $('#formcopupons').addClass('d-none');
        $('#removecupon').removeClass('d-none');
    }
}



function makPayment(){
   
    
    var baseUrl = window.location.origin;
 
            $.ajax({
                    type:'get',
                    url:baseUrl+'/user/payment',
                    dataType:'JSON',
                    success:function(res) {
                        if(res.success){
                             toastr["success"](res.success);
                         }
                         if(res.error){
                            toastr["error"](res.error);
                        }

                        if (res.Currency_placement == 1) {  

                            var placement_left = " "
                            var placement_right = res.Currency
                            
                        } else {
                
                            var placement_left = res.Currency
                            var placement_right = " "
                            
                        }
                        

                        $('#paymentmodal').html('<div class="modal-header border-radius-fix">'+
                                             
                                                    '<h5 class="modal-title " id="exampleModalCenterTitle"> Payment :- '+ placement_left + " " + res.cart.Amount + " " + placement_right +'   </h5>'+
                                    
                                            ' </div>'+
                                            '<div class="modal-body">'+
                                                
                                               ' <form method="post" action="/user/order"  >'+
                                                
                                                      
                                                           ' <div class="form-group">'+
                                                               ' <label for="accounttype">Account Type</label>'+
                                                               ' <select name="accounttype" id="accounttype" class="form-control border-secondary" onchange="trantype(this.value)">'+
                                                                   
                                                               ' </select>'+
                                                         '   </div>'+
                                                            '<div class="form-group" id="transref">'+
                                                              '  <label for="transref">Transaction reference ('+res.Currency+') -(Optional)</label>'+
                                                              '<input type="text" class="form-control border-secondary" id="transref" name="transref" >'+
                                                           ' </div>'+

                                                     
                                                           ' <div class="form-group" id="colleCash">'+
                                                                '<label for="colleCash">Collected cash ('+res.Currency+')</label>'+
                                                               
                                                                ' <input type="number" class="form-control border-secondary" id="colleCash" onkeyup="cash( '+res.cart.Amount+',this.value)" name="colleCash" >'+
                                                          '</div>'+

                                                           '<div class="form-group" id="returnCash">'+
                                                              '  <label for="returnCash">Returned amount ('+res.Currency+')</label>'+
                                                               ' <input type="number" class="form-control border-secondary" id="returnCash1" name="returnCash" readonly>'+
                                                           ' </div>'+
                                                           
                                                           '<div class="form-group" id="wallCash">'+
                                                                '<label for="wallCash">Wallet Balance ('+res.Currency+')</label>'+
                                                                ' <input type="number" class="form-control border-secondary" id="wallCash" name="wallCash" value='+ res.coustomer.Balance +' readonly >'+
                                                          '</div>'+

                                                          ' <div class="form-group" id="rmaiWallCash">'+
                                                                '<label for="rmaiWallCash"> remain Wallet Balance ('+res.Currency+')</label>'+
                                                                ' <input type="number" class="form-control border-secondary" id="rmaiWallCash" name="rmaiWallCash" value='+ (res.coustomer.Balance- res.cart.Amount) +' readonly >'+
                                                          '</div>'+
                                                          ' <div class="form-group m-t-45">'+
                                                                ' <button class="btn btn-success " type="submit" ><i class="dripicons-checkmark"></i> Save</button>'+
                                                         ' </div> '+
                                                     
                                                 
                                               ' </form> '+
                                           ' </div> ' );

                                           $.each(res.account, function(index, value){
                                                $('#accounttype').append(' <option value="'+value._id+'">'+value.accTitel+' </option>');
                                                
                                            });
                                            if(res.coustomer.cousName != "walking customer"){
                                                $('#accounttype').append(' <option value="1"> wallet Balance </option>');
                                            }

                                           
                                            $('#colleCash').addClass('d-none');
                                            $('#returnCash').addClass('d-none');
                                            $('#wallCash').addClass('d-none');
                                            $('#rmaiWallCash').addClass('d-none');
                                           
                                           
                                          
                                           $('#modal').modal('show')

                    }
            });
    
};


function trantype(val){
    if(val == 1){
        $('#wallCash').removeClass('d-none');
        $('#rmaiWallCash').removeClass('d-none');
        $('#transref').addClass('d-none');
        $('#colleCash').addClass('d-none');
        $('#returnCash').addClass('d-none');
    }

    if(val == '6347a44c4640062aa0c60590'){
        $('#colleCash').removeClass('d-none');
        $('#returnCash').removeClass('d-none');
        $('#transref').addClass('d-none');
        $('#wallCash').addClass('d-none');
        $('#rmaiWallCash').addClass('d-none');
    }

    if(val != '6347a44c4640062aa0c60590' && val != 1){
        $('#colleCash').addClass('d-none');
        $('#returnCash').addClass('d-none');
        $('#transref').removeClass('d-none');
        $('#wallCash').addClass('d-none');
        $('#rmaiWallCash').addClass('d-none');
    }



}

function cash(amount,cash){
    var remai = parseInt(cash)- parseInt(amount);
    $('#returnCash1').val(remai)

}





