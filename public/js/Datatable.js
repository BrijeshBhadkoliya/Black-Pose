$(document).ready(function () {
    $('#DataTable').DataTable({
        order: [[0, 'desc']]
    });

    $('#AccDataTable').DataTable({
      
    });

    var table = $('#datatable-buttons').DataTable({
        lengthChange: false,
        responsive: true,
        order: [[0, 'desc']],
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
    });

    table.buttons().container().appendTo('#datatable-buttons_wrapper .col-md-6:eq(0)');
});
