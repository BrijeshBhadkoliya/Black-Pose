

        //print div
        $(document).on('click', '#Print', function () {
            var status = document.getElementById('printredy').value;
            if (!status) return;
        
            var printContents = document.getElementById('printLable').innerHTML;
            var originalContents = document.body.innerHTML;
        
            document.body.innerHTML = printContents;
            window.print();
        
            // Restore original content after print
            document.body.innerHTML = originalContents;
            location.reload(); // optional — agar reset karna ho form etc.
        });

        //// privew butten click logic
   $(document).on('click', '#Privew', function () {
    var size = document.getElementById('papersize').value;
    var quntity = parseInt(document.getElementById('prinquntity').value);

    if (size == '') {
        return toastr["error"]("please select paper size");
    }
    if (!quntity) {
        return toastr["error"]("please select label quantity");
    }

    document.getElementById('printdiv').innerHTML = '';

    var name = document.getElementById('name').innerText;
    var code = document.getElementById('code').innerText;
    var prize = document.getElementById('price').value;

    const perPage = 40;
    let barcodeCount = 0;

    for (let page = 0; page < Math.ceil(quntity / perPage); page++) {
        let pageDiv = document.createElement('div');
        pageDiv.classList.add('print-page'); // page wrapper

        for (let i = 0; i < perPage && barcodeCount < quntity; i++, barcodeCount++) {
            let mainDiv = document.createElement('div');
            mainDiv.classList.add(size, 'item');

            let barcodeId = `barcode-${barcodeCount}`; // unique ID for each barcode

            let markup = `
                <p class="shopeName"> Black POS Supper Store</p>
                <p class="name">${name}</p>
                <svg id="${barcodeId}"></svg>
                <p class="price"> ${prize}</p>
            `;

            mainDiv.innerHTML = markup;
            pageDiv.appendChild(mainDiv);

            // Initialize JsBarcode after short delay
            setTimeout(() => {
                JsBarcode(`#${barcodeId}`, code, {
                    textAlign: "center",
                    textPosition: "top",
                    font: "Muli",
                    fontOptions: "light",
                    fontSize: 3,
                    textMargin: 10,
                    displayValue: false,
                });
            }, 50);
        }

        document.getElementById('printdiv').appendChild(pageDiv);
    }

    document.getElementById('printredy').value = "ok";
    $('#printLable').removeClass('d-none');
});


        // reset
        $(document).on('click','#Reset', function(){
            document.getElementById('papersize').value= '';
            document.getElementById('prinquntity').value= "";
            document.getElementById('printdiv').innerHTML = ''
            $('#printLable').addClass('d-none')
        });

        
