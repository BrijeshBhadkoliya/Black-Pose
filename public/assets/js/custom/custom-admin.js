$(document).ready(function(){


    var url = window.location.origin
    $.ajax({
        type:'get',
        url:url+ "/chart",
        dataType:'json',
        success:function(res){
            
            var week = res.map((data)=>{
                return data._id + "  week" ;
            })
            var year = res.map((data)=>{
                return data.year + "  year" ;
            })
            var income = res.map((data)=>{
                return (data.income).toFixed(0)
            })
            
            var expense = res.map((data)=>{
                return (data.expens).toFixed(0)
            })
            var total = res.map((data)=>{
                return ((data.income - data.expens)).toFixed(0)
            })
            

            if (res[0].Currency_placement == 1 ) {

                var  placement_left = " "
                var  placement_right = res[0].Currency
                
            } else {

                var  placement_left = res[0].Currency
                var  placement_right = " "
            }
            
            // var options = {
            //         chart: {
            //             height: 295,
            //             type: 'bar',
            //             toolbar: {
            //                 show: false
            //             },
            //             zoom: {
            //                 enabled: false
            //             }
            //         },
            //         plotOptions: {
            //             bar: {
            //                 horizontal: false,
            //                 columnWidth: '60%',
            //                 endingShape: 'rounded'  
            //             },
            //         },
            //         dataLabels: {
            //             enabled: false
            //         },
            //         stroke: {
            //             show: true,
            //             width: 2,
            //             colors: ['transparent']
            //         },
            //         colors: ['#0080ff','#18d26b','#d4d8de'],
            //         series: [{
            //             name: 'Income',
            //             data: income
            //         }, {
            //             name: 'Expence',            
            //             data: expense
            //         }, {
            //             name: 'Revanue',
            //             data:total
            //         }],
            //         legend: {
            //             show: false,
            //         },
            //         xaxis: {
            //             categories: week,
            //             axisBorder: {
            //                 show: true, 
            //                 color: 'rgba(0,0,0,0.05)'
            //             },
            //             axisTicks: {
            //                 show: true, 
            //                 color: 'rgba(0,0,0,0.05)'
            //             }
            //         },
            //         yaxis: {
            //             title: {
            //                 text: ''
            //             }
            //         },
            //         grid: {
            //             row: {
            //                 colors: ['transparent', 'transparent'], opacity: .2
            //             },
            //             borderColor: 'rgba(0,0,0,0.05)'
            //         },
            //         fill: {
            //             opacity: 1

            //         },
            //         tooltip: {
            //             y: {
            //                 formatter: function (val) {
            //                     return "$ " + val + " thousands"
            //                 }
            //             }
            //         }
            //     }
            //     var chart = new ApexCharts(
            //         document.querySelector("#apex-basic-column-chart"),
            //         options
            //     );


                var options = {
                    chart: {
                        height: 300,
                        type: 'area',
                        toolbar: {
                            show: false
                        },
                        zoom: {
                          type: 'x',
                          enabled: false,
                          autoScaleYaxis: true
                        },
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'smooth',
                    },
                    colors: ['#d4d8de','#18d26b','#0080ff'],
                    series: [{
                        name: 'Income',
                        data: income
                    }, {
                        name: 'Expence',            
                        data: expense
                    }, {
                        name: 'Revanue',
                        data:total
                    }],
                    legend: {
                        show: false,
                    },
                    xaxis: {
                        // type: 'datetime',
                        categories: week,
                        // categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],
                        axisBorder: {
                            show: true, 
                            color: 'rgba(0,0,0,0.05)'
                        },
                        axisTicks: {
                            show: true, 
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    grid: {
                        row: {
                            colors: ['transparent', 'transparent'], opacity: .2
                        },
                        borderColor: 'rgba(0,0,0,0.05)'
                    },
                    tooltip: {
                        y: {
                            formatter: function (val) {
                                return placement_left + " " + val + " " + placement_right
                            }
                        }
                    },
                    
                }
                var chart = new ApexCharts(
                    document.querySelector("#apex-area-chart"),
                    options
                );
                
                chart.render();

                
                var revn = res.pop();
                // alert(revn)
                $('#revweek').html('<h3 id="revweek">' + placement_left + " " +(revn.income - revn.expens).toFixed(0) + " " + placement_right +'</h3>')
                
        }
    })

    
    

})