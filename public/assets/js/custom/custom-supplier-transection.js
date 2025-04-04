$(document).ready(function()
    {
        $(document).on('click', '#paysup', function(){
            var id= this.value.split('+$')[0];
            var dueAmount = this.value.split('+$')[1];
            var baseUrl = window.location.origin;
            $.ajax({
                        type:'get',
                        url:baseUrl+'/account/listdata',
                        dataType:'JSON',
                        success:function(res) {
                           
                            $('#modelsho').html('<div class="modal-header border-radius-fix">'+
                                                '<h5 class="modal-title" id="exampleModalCenterTitle"> Update Coustomer balance </h5>'+
                                            '</div>'+
                                            '<div class="modal-body">'+
                                                
                                                    '<form method="post" action="/supplier/paysupplier/'+id+'"  class="needs-validation" >'+
                                            ' <div class="row">'+
                                                ' <div class="col-6 ">'+
                                                        '<div class="form-group">'+
                                                        ' <label for="due">Total Due Amount</label>'+
                                                        ' <input type="text" class="form-control border-secondary" id="due"  name="due" value="'+dueAmount+'" disabled>'+
                                                    '  </div>'+
                                                    '<div class="form-group">'+
                                                        ' <label for="balAcc">Select account</label>'+
                                                        ' <select name="Account" id="balAcc" class="form-control border-secondary">'+
                                                            ' <option>Select receive account </option>'+
                                                        
                                                        ' </select>'+
                                                    '  </div>'+

                                                    ' <div class="form-group m-t-45">'+
                                                        ' <button class="btn btn-success " type="submit" value="submit"><i class="dripicons-checkmark"></i> Save</button>'+
                                                    ' </div> '+
                                                    
                                                    
                                                '  </div>'+
                                                '  <div class="col-6">'+
                                                
                                                    '   <div class="form-group">'+
                                                        ' <label for="amount">Pay Amount</label>'+
                                                            '<input type="Number" class="form-control border-secondary" id="amount" name="amount"  required>'+
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