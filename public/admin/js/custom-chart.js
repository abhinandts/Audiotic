
document.addEventListener('DOMContentLoaded', function () {
    (function ($) {
        "use strict";

        // Function to fetch data from the server
        async function fetchChartData() {
            try {
                // Fetching the data from your server
                const response = await fetch('/admin/api/dashboard/getChartData');
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching chart data:", error);
                return null;
            }
        }

        /* Sale statistics Chart */
        if ($('#myChart').length) {
            // Fetch data after DOM is fully loaded
            fetchChartData().then(data => {
                if (data) {
                    // Once data is available, create the chart
                    var ctx = document.getElementById('myChart').getContext('2d');
                    var chart = new Chart(ctx, {
                        type: 'line', // The type of chart we want to create
                        data: {
                            labels: data.labels, // Use dynamic labels from server
                            datasets: [{
                                label: 'Delivered ',
                                tension: 0.3,
                                fill: true,
                                backgroundColor: 'rgba(44, 120, 220, 0.2)',
                                borderColor: 'rgba(44, 120, 220)',
                                data: data.deliveredOrders // Use dynamic data from server
                            },
                            {
                                label: 'Cancelled',
                                tension: 0.3,
                                fill: true,
                                backgroundColor: 'rgba(4, 209, 130, 0.2)',
                                borderColor: 'rgb(4, 209, 130)',
                                data: data.cancelledOrders
                            },
                            {
                                label: 'Returned',
                                tension: 0.3,
                                fill: true,
                                backgroundColor: 'rgba(380, 200, 230, 0.2)',
                                borderColor: 'rgb(380, 200, 230)',
                                data: data.returnedOrders
                            }
                        ]
                        },
                        options: {
                            plugins: {
                                legend: {
                                    labels: {
                                        usePointStyle: true,
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
    })(jQuery);
});