// (function(){

//     function init(){

//         let tableBody,orderFilter,pdfDownload;
        
//         function initializeElements(){
//             tableBody = document.getElementById('table-body')
//             orderFilter = document.getElementById('order-filter')
//             pdfDownload = document.getElementById('download-pdf')
//         }

//         function initializeEventListeners(){
//             orderFilter.addEventListener('change',filter)
//             pdfDownload.addEventListener('click', downloadPDF)
//         }

//         function downloadPDF() {
//             const element = document.getElementById('table-body');
//             const options = {
//                 filename: 'sales_orders.pdf',
//                 html2canvas: { scale: 2 },
//                 jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
//             };
//             html2pdf().from(element).set(options).save();
//         }

//         async function filter (e){
//             const selectedValue = e.target.value;

//             const response = await fetch(`/admin/api/sales/value?filter=${selectedValue}`)

//             if(!response.ok){
//                 throw new Error ('Failed to fetch orders');
//             }

//             const orders = await response.json();
//             updateOrderTable(orders)
//         }

//         async function fetchAndLoadOrders(){
//             const response = await fetch('/admin/api/sales/getSalesOrders')

//             if(!response.ok){
//                 throw new Error ('Failed to fetch sales orders');
//             }
//             const orders = await response.json();
//             updateOrderTable(orders)
//         }

//         function updateOrderTable(orders){
//             tableBody.innerHTML = "";
//             orders.forEach(element => {
//                 const orderItem = createOrderItem(element);
//                 tableBody.appendChild(orderItem)
//             });
//         }
//         function createOrderItem(element){
//             const orderItem = document.createElement('tr');

//             const date = new Date(element.createdAt);
//             const formattedDate = date.toLocaleDateString("en-IN",);
//             const formattedTime = date.toLocaleTimeString("en-IN", {
//                 hour: '2-digit', 
//                 minute: '2-digit'
//             });
        
//             orderItem.innerHTML = `
//                                     <td>${formattedDate} ${formattedTime}</td>

//                                     <td>${ element.user.email }</td>
//                                     <td>
//                                         <a href="/admin/showOrder/${ element.orderId }">${ element.orderId }</a></td>
//                                     <td>
//                                         <span class="badge rounded-pill ${ element.paymentMethod === 'Cash on Delivery' ?'alert-info' : element.paymentMethod === 'Wallet' ? 'alert-secondary' : element.paymentMethod === 'Razorpay' ? 'alert-primary' : '' }">
//                                             ${element.paymentMethod }
//                                         </span>
//                                     </td>
//                                     <td>
//                                         <span
//                                             class="badge rounded-pill ${ element.paymentStatus === 'Paid' ? 'alert-success' : element.paymentStatus === 'Pending' ? 'alert-warning' : element.paymentStatus === 'Refunded' ? 'alert-secondary' : element.paymentStatus === 'Failed' ? 'alert-danger' : element.paymentStatus === 'Not Applicable' ? 'alert-info' : '' }"
//                                         >
//                                             ${ element.paymentStatus }
//                                         </span>
//                                     </td>

//                                     <td>${ element.orderTotal.toLocaleString("en-IN") } .00</td>
//             `;
//             return orderItem;
//         }

//         initializeElements()
//         initializeEventListeners()
//         fetchAndLoadOrders()
//     }

//     document.addEventListener('DOMContentLoaded',init)
// })()




(function(){
    function init(){
        let tableBody, orderFilter, downloadPdfBtn, downloadExcelBtn, previewBtn;

        function initializeElements(){
            tableBody = document.getElementById('table-body');
            orderFilter = document.getElementById('order-filter');
            downloadPdfBtn = document.getElementById('download-pdf');
            downloadExcelBtn = document.getElementById('download-excel');
            previewBtn = document.getElementById('preview-orders');
        }

        function initializeEventListeners(){
            orderFilter.addEventListener('change', filter);
            downloadPdfBtn.addEventListener('click', downloadPDF);
            downloadExcelBtn.addEventListener('click', downloadExcel);
            previewBtn.addEventListener('click', previewOrders);
        }

        async function filter(e){
            const selectedValue = e.target.value;
            const response = await fetch(`/admin/api/sales/value?filter=${selectedValue}`);
            if(!response.ok){
                throw new Error ('Failed to fetch orders');
            }
            const orders = await response.json();
            updateOrderTable(orders);
        }

        async function fetchAndLoadOrders(){
            const response = await fetch('/admin/api/sales/getSalesOrders');
            if(!response.ok){
                throw new Error ('Failed to fetch sales orders');
            }
            const orders = await response.json();
            updateOrderTable(orders);
        }

        function updateOrderTable(orders){
            tableBody.innerHTML = "";
            orders.forEach(element => {
                const orderItem = createOrderItem(element);
                tableBody.appendChild(orderItem);
            });
        }

        function createOrderItem(element){
            const orderItem = document.createElement('tr');
            const date = new Date(element.createdAt);
            const formattedDate = date.toLocaleDateString("en-IN");
            const formattedTime = date.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });

            orderItem.innerHTML = `
                <td>${formattedDate} ${formattedTime}</td>
                <td>${ element.user.email }</td>
                <td><a href="/admin/showOrder/${ element.orderId }">${ element.orderId }</a></td>
                <td><span class="badge rounded-pill ${ getPaymentMethodClass(element.paymentMethod) }">${ element.paymentMethod }</span></td>
                <td>${ element.orderTotal.toLocaleString("en-IN") } .00</td>
            `;
            return orderItem;
        }

        function getPaymentMethodClass(method){
            return method === 'Cash on Delivery' ? 'alert-info' :
                   method === 'Wallet' ? 'alert-secondary' :
                   method === 'Razorpay' ? 'alert-primary' : '';
        }

        function getPaymentStatusClass(status){
            return status === 'Paid' ? 'alert-success' :
                   status === 'Pending' ? 'alert-warning' :
                   status === 'Refunded' ? 'alert-secondary' :
                   status === 'Failed' ? 'alert-danger' :
                   status === 'Not Applicable' ? 'alert-info' : '';
        }

        function previewOrders(){
            // You can customize the modal or page to preview the orders here
            alert('Preview orders - this can open a modal or new page with the orders table');
        }

        function downloadPDF(){
            const element = document.querySelector('.table-responsive');  // Get the table container
            html2pdf(element, {
                margin:       1,
                filename:     'sales_report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 1 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            });
        }

        function downloadExcel(){
            let table = document.querySelector('table');
            let tableHtml = table.outerHTML.replace(/ /g, '%20');

            let a = document.createElement('a');
            a.href = 'data:application/vnd.ms-excel,' + tableHtml;
            a.download = 'sales_report.xls';
            a.click();
        }

        initializeElements();
        initializeEventListeners();
        fetchAndLoadOrders();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
