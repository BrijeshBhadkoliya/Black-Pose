function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
 $(document).ready(function()
 {
     $(document).on('click','#gen_code',function()
     {
         $('#ccode').val(makeid(8));
         return false;
     });

     $(document).on('change', '#distype', function(){
          var typ = this.value
          $('#distyp').html('<label id="distyp" for="disc">Discount '+ typ +' </label>')

     })

     $(document).on('change','#procat',function()
      {
          var id = this.value;
          var baseUrl = window.location.origin;
       
          $.ajax({
                  type:'POST',
                  url:baseUrl+'/product/subcat',
                  data:
                  {
                      cat_id:id
                  },
                  dataType:'JSON',
                  success:function(res) {
                      $('#prosubcat').html('<option value=" ">Select Subcategory</option>');
                      $.each(res.subcatNames, function(index,val){
                          $("#prosubcat").append('<option value="' + val.subcatname + '">' + val.subcatname + '</option>');
                      });
                  }
          });
      });
 
     
     
  });