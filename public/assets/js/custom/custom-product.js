function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 $(document).ready(function () {
    const baseUrl = window.location.origin;

    // Generate random code
    $(document).on('click', '#gen_code', function () {
        $('#ccode').val(makeid(8));
        return false;
    });

    // Discount type label change
    $(document).on('change', '#distype', function () {
        const typ = this.value;
        $('#distyp').html('<label id="distyp" for="disc">Discount ' + typ + ' </label>');
    });

    // Category change triggers subcategory load
    $(document).on('change', '#procat', function () {
        const catId = this.value;
        loadSubcategories(catId);
    });

    // When user clicks on subcategory without selecting category
    $(document).on('click', '#prosubcat', function () {
        const cat = $('#procat').val();
        if (!cat || cat === 'Select Category') {
            $('#prosubcat').html('<option value="">Please Select Category</option>');
        }
    });

    // 🔥 On page load: Load subcategories if category is already selected
    const selectedCategory = $('#procat').val();
    const selectedSubcategory = $('#prosubcat').data('selected');

    if (selectedCategory) {
        loadSubcategories(selectedCategory, selectedSubcategory);
    }

    // 🧩 Reusable subcategory loader
    function loadSubcategories(categoryName, preselectSubcat = "") {
        if (!categoryName) return;

        $.ajax({
            type: 'POST',
            url: baseUrl + '/product/subcat',
            data: { cat_id: categoryName },
            dataType: 'JSON',
            success: function (res) {
                $('#prosubcat').html('<option value="">Select Subcategory</option>');
                $.each(res.subcatNames, function (index, val) {
                    const selectedAttr = val.subcatname === preselectSubcat ? "selected" : "";
                    $('#prosubcat').append(`<option value="${val.subcatname}" ${selectedAttr}>${val.subcatname}</option>`);
                });
            }
        });
    }
     
});