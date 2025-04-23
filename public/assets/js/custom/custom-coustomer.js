$(document).ready(function()
{

    $(document).on('click', '#addbalce', function(){
        var data = this.value;
        var baseUrl = window.location.origin;

        $.ajax({
                type:'get',
                url:baseUrl+'/account/listdata',
                dataType:'JSON',
                success:function(res) {
                    $('#modelsho').html('<div class="modal-header border-radius-fix">'+
                                        '<h5 class="modal-title" id="exampleModalCenterTitle"> Update Customer Balance </h5>'+
                                    '</div>'+
                                    '<div class="modal-body">'+
                                        
                                            '<form method="post" action="/wallet/add/'+data+'"  class="needs-validation" >'+
                                    ' <div class="row">'+
                                        ' <div class="col-6 ">'+
                                                '<div class="form-group">'+
                                                ' <label for="balance">Balance</label>'+
                                                ' <input type="number" class="form-control border-secondary" id="balance" min="0" name="balance"  required>'+
                                            '  </div>'+
                                            '<div class="form-group">'+
                                                ' <label for="balAcc">Balance receive account</label>'+
                                                ' <select name="balAcc" id="balAcc" class="form-control border-secondary">'+
                                                    ' <option>Select receive account </option>'+
                                                
                                                ' </select>'+
                                            '  </div>'+

                                            ' <div class="form-group m-t-45">'+
                                                ' <button class="btn btn-success " type="submit" value="submit"><i class="dripicons-checkmark"></i> Save</button>'+
                                            ' </div> '+
                                            
                                            
                                        '  </div>'+
                                        '  <div class="col-6">'+
                                        
                                            '   <div class="form-group">'+
                                                ' <label for="disc">Description</label>'+
                                                    '<input type="text" class="form-control border-secondary" id="disc" name="disc" min="1" required>'+
                                            '  </div>'+

                                            ' <div class="form-group">'+
                                                '  <label for="date">Date</label>'+
                                                ' <input type="date" class="form-control border-secondary" id="date" name="date" required>'+
                                            ' </div>'+
                                            
                                        
                                
                                            
                                            '</div>'+
                                            '</form> '+
                                        ' </div>'
                                
                                            )
                            $.each(res, function(index, value){
                                $('#balAcc').append('<option value="'+value._id+'"> '+ value.accTitel+' </option>');
                            });
                            $('#modal').modal()

                }
        });
        
 
       
   
        
    
       
      
    })





})