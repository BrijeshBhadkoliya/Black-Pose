$(document).on("click", "#coustomer_order_invoices", function () {
    var id = this.value;
    var baseUrl = window.location.origin;

    $.ajax({
      type: "get",
      url: baseUrl + "/coustomer/invoice/" + id,
      dataType: "JSON",
      success: function (res) {
        // Handle Currency Placement
        

        var placement_left = "";
        var placement_right = res.footer.Currency;

        if (res.Currency_placement === 1) {
          placement_left = " ";
          placement_right = res.footer.Currency;
        } else {
          placement_left = res.footer.Currency;
          placement_right = " ";
        }

        // Construct the modal content dynamically
        var invoiceContent = `
                     <hr>
                                                <div class="row d-flex justify-content-around">
                                                    <div class="col-4">
                                                        <p><span class="font-weight-bold">Order Id:</span> ${
                                                          res.data.orderId
                                                        }</p>
                                                    </div>
                                                    <div class="col-4">
                                                        <p>${
                                                          res.data.createdAt.split(
                                                            "T"
                                                          )[0]
                                                        }</p>
                                                    </div>
                                                </div>
                                                <hr>
                                                <div class="table-responsive">
                                                    <table id="default-datatable" class="display table">
                                                        <thead>
                                                            <tr>
                                                                <th>Sr No</th>
                                                                <th>Item</th>
                                                                <th>QTY</th>
                                                                <th>Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="item" class="align-items-center">
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <hr>
                                                <div class="row justify-content-end">
                                                    <table class="col-6 table table-borderless text-right">
                                                        <tbody>
                                                            <tr>
                                                                <td>Item Price :</td>
                                                                <td class="text-left">${placement_left} ${
          res.data.SubTotal - res.data.Productdiscount
        } ${placement_right}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Tax:</td>
                                                                <td class="text-left">${placement_left} ${
          res.data.Tax
        } ${placement_right}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Coupon :</td>
                                                                <td class="text-left">${placement_left} ${
          res.data.Coupondiscount
        } ${placement_right}</td>
                                                            </tr>
                                                            <tr>
                                                                <td class="font-weight-bold font-18">Total :</td>
                                                                <td class="text-left">${placement_left} ${
          res.data.Amount
        } ${placement_right}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <hr>
                                                <div class="row">
                                                    <p class="m-l-15">Paid By : ${
                                                      res.data.paymentMethod
                                                        .type
                                                    }</p>
                                                </div>
                                                <hr>
                                                <center>
                                                    <h3 class="font-18">******** Thank You ********</h3>
                                                </center>
                                                <hr>
                `;

        // Inject the generated HTML into the modal
        $("#invoicemodal").html(invoiceContent);

        // Loop through items and append to the table
        $.each(res.data.item, function (index, value) {
          $("#item").append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                <h6>${value.productName}</h6>
                                <p>Price: ${placement_left} ${value.productPrice} ${placement_right}</p>
                                <p>Discount: ${placement_left} ${value.discount} ${placement_right}</p>
                            </td>
                            <td>${value.productCount}</td>
                            <td>${placement_left} ${value.productPrice * value.productCount - value.discount * value.productCount} ${placement_right}</td>
                        </tr>
                    `);
        });

        // Show the modal
        $("#modal").modal("show");
      },
      error: function (err) {
        console.error("Error fetching invoice data: ", err);
      },
    });
  });

  $(document).on("click", "#pri_invo", function () {
    const printContents = document.getElementById("finalinvoice").innerHTML;
  
    const printWindow = window.open('', '', 'width=800,height=600');
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContents}
        </body>
      </html>
    `);
  
    printWindow.document.close();
    setTimeout(() => {
      $("#modal").modal("hide");
    }, 1000);
  });
  