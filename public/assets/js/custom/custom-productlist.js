$(document).ready(function()
{

    $(document).on('click', '#addqun', function(){
        var data = this.value;
        $('#modelsho').html('<div class="modal-header">'+
                                        '<h5 class="modal-title" id="exampleModalCenterTitle"> Update Product Quntity</h5>'+
                                        
                                        '</button>'+
                                    '</div>'+
                                    '<div class="modal-body">'+
                                       '<h5>If the value is negative, use i.e. -10.</h5>'+
                                            '<form action="/product/quntity/'+ data +'" method="post">'+
                                                ' <div class="form-group">'+
                                                    ' <label for="quntity">Quantity </label>'+
                                                    ' <input type="number" class="form-control border-secondary" id="quntity" name="quantity">'+
                                                '</div>'+
                                                ' <div class="form-group">'+
                                                    ' <label for="date">Date </label>'+
                                                    ' <input type="date" class="form-control border-secondary" id="date" name="date">'+
                                                '</div>'+
                                                '<button class="btn btn-success m-t-20">Add Quntity</button>'+
                                            ' </form> '+
                                   ' </div>'+
                                  ' <div class="modal-footer">'+
                                       ' <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
                                   ' </div>'
                                    )
       $('#exampleModalCenter').modal()
    })





})
