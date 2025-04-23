$(document).ready(function () {
    var url = window.location.origin;

    $.ajax({
        type: 'GET',
        url: url + "/role",
        dataType: 'json',
        success: function (res) {
            function applyPermissions() {
                $.each(res.data.product, function (index, value) {
                    $(".pro" + value).removeClass('d-none');
                });
                $.each(res.data.limit_product_list, function (index, value) {
                    $(".lim" + value).removeClass('d-none');
                });
                $.each(res.data.category, function (index, value) {
                    $(".cat" + value).removeClass('d-none');
                });
                $.each(res.data.brand, function (index, value) {
                    $(".bra" + value).removeClass('d-none');
                });
                $.each(res.data.coupon, function (index, value) {
                    $(".cou" + value).removeClass('d-none');
                });
                $.each(res.data.account, function (index, value) {
                    $(".acc" + value).removeClass('d-none');
                });
                $.each(res.data.income, function (index, value) {
                    $(".inc" + value).removeClass('d-none');
                });
                $.each(res.data.expense, function (index, value) {
                    $(".exp" + value).removeClass('d-none');
                });
                $.each(res.data.coustomer, function (index, value) {
                    $(".com" + value).removeClass('d-none');
                });
                $.each(res.data.supplier, function (index, value) {
                    $(".sup" + value).removeClass('d-none');
                });
                $.each(res.data.setting, function (index, value) {
                    $(".set" + value).removeClass('d-none');
                });
            }

            // Initialize DataTable with drawCallback
            if (!$.fn.DataTable.isDataTable('#DataTable')) {
                $('#DataTable').DataTable({
                    order: [[0, 'desc']],
                    drawCallback: function () {
                        applyPermissions();
                    }
                });
            }

            applyPermissions(); // Re-apply visibility after table redraw
             

            $('#footer').html('<p class="mb-0" id="footer">' + res.footer.Footer + '</p>');
        }
    });
});
