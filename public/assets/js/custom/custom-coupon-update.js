function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
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
         $('#ccode').val(makeid(6));
         return false;
     });

     $(document).on('change', '#disType', function(){
          var typ = this.value
        
          $('#disAmount').html('<label id="disAmount" for="disAmount" >Discount '+ typ +' </label>');

     });

     $(document).on('change','#startDate', function(){
       var sdate = this.value;
       var edate = document.getElementById('endDate').value;
          if(edate){
              if(sdate > edate){
               alert('please select valid date,.....start date must be greter then end date')
               document.getElementById('startDate').value = ''
              }
          }
     })

     $(document).on('change','#endDate', function(){
       var edate = this.value;
       var sdate = document.getElementById('startDate').value;
          if(sdate){
              if(sdate > edate){
               alert('please select valid date,.....start date must be greter then end date')
               document.getElementById('endDate').value = ''
              }
          }
     })

     
 
     
     
  });