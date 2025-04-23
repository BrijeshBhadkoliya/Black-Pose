$(document).ready(function(){

    $(document).on('change','#Accfrom',function(){
        var id = this.value;
        var baseUrl = window.location.origin;
        $.ajax({
            type:'post',
            url:baseUrl+"/account/tranAccount",
            data:{idacc:id},
            dataType:'JSON',
            success:function(res){
                $('#AccTo').html(' <option value="">Select Account</option>');
                $.each(res, function(index, value){
                    $('#AccTo').append('<option value="' + value._id + '">' + value.accTitel + '</option>')
                   
                })
            }
        })
    })


})