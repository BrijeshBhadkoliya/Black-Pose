$(document).on('click', '#addqun', function () {
    const productId = this.value;
  
    $('#modelsho').html(`
      <div class="modal-header">
        <h5 class="modal-title">Update Product Quantity</h5>
      </div>
      <div class="modal-body">
        <h5>If decrement, use negative values (e.g. -10)</h5>
        <form action="/product/quantity/${productId}" method="post">
          <div class="form-group">
            <label for="quantity">Quantity</label>
            <input type="number" class="form-control border-secondary" name="quantity" required>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" class="form-control border-secondary" name="date" required>
          </div>
          <button class="btn btn-success mt-3">Update Quantity</button>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    `);
  
    $('#exampleModalCenter').modal();
  
    setTimeout(() => {
      $('input[name="date"]').val(new Date().toISOString().split('T')[0]);
    }, 200);
  });
  