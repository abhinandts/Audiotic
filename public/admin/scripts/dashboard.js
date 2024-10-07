(function () {

    let tableBody, orderFilter, downloadPdfBtn, downloadExcelBtn, dateFilterBtn;

    function initializeElements() {

        tableBody = document.getElementById('table-body');
        orderFilter = document.getElementById('order-filter');
        downloadPdfBtn = document.getElementById('download-pdf');
        downloadExcelBtn = document.getElementById('download-excel');
        dateFilterBtn = document.getElementById('apply-date-filter');
    }

    function initializeEventListeners() {

        orderFilter.addEventListener('change', filter);
        downloadPdfBtn.addEventListener('click', downloadPDF);
        downloadExcelBtn.addEventListener('click', downloadExcel);
        dateFilterBtn.addEventListener('click',filterByDate);
    }

    async function filterByDate(){
        const sDate = document.getElementById('start-date').value;
        const eDate = document.getElementById('end-date').value;

        if (!sDate || !eDate) {
            showToast("Please select both start and end dates.","error");
            return;
        }

        const startDate = new Date(sDate);
        const endDate = new Date(eDate);
        const today = new Date();

        if (startDate > endDate) {
            showToast("Start date cannot be later than the end date.","error");
            return;
        }

        if (startDate > today || endDate > today) {
            showToast("Selected dates cannot be in the future.", "error");
            return;
        }

        try {

            const response = await fetch ('/admin/api/dashboard/filterByDate',{
                method : 'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({sDate,eDate})
            })

            if(!response.ok){
                throw new Error(`Error: ${response.status}`)
            }

            const result = await response.json();
            updateOrderTable(result);
            showToast("Orders updated","success")

        } catch (error) {
            console.error(error)
        }
    }

    async function filter(e) {
        const selectedValue = e.target.value;
        const response = await fetch(`/admin/api/dashboard/value?filter=${selectedValue}`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const orders = await response.json();
        updateOrderTable(orders);
    }

    async function fetchAndLoadOrders() {

        const response = await fetch('/admin/api/sales/getSalesOrders');
        if (!response.ok) {
            throw new Error('Failed to fetch sales orders');
        }
        const orders = await response.json();
        updateOrderTable(orders);
    }

    function updateOrderTable(orders) {
        tableBody.innerHTML = "";
        orders.forEach(element => {
            const orderItem = createOrderItem(element);
            tableBody.appendChild(orderItem);
        });
    }

    function createOrderItem(element) {
        const orderItem = document.createElement('tr');
        const date = new Date(element.createdAt);
        const formattedDate = date.toLocaleDateString("en-IN");
        const formattedTime = date.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });

        orderItem.innerHTML = `
                <td>${formattedDate} ${formattedTime}</td>
                <td>${element.user.email}</td>
                <td><a href="/admin/showOrder/${element.orderId}">${element.orderId}</a></td>
                <td><span class="badge badge-pill ${getPaymentMethodClass(element.paymentMethod)}">${element.paymentMethod}</span></td>
                <td>${element.orderTotal.toLocaleString("en-IN")} .00</td>
            `;
        return orderItem;
    }

    function getPaymentMethodClass(method) {
        return method === 'Cash on Delivery' ? 'alert-info' :
            method === 'Wallet' ? 'alert-secondary' :
                method === 'Razorpay' ? 'alert-primary' : '';
    }

    function downloadPDF() {
        const element = document.querySelector('.table-responsive');
        html2pdf(element, {
            margin: 1,
            filename: 'sales_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 1 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        });
    }

    function downloadExcel() {
        let table = document.querySelector('table');
        let tableHtml = table.outerHTML.replace(/ /g, '%20');

        let a = document.createElement('a');
        a.href = 'data:application/vnd.ms-excel,' + tableHtml;
        a.download = 'sales_report.xls';
        a.click();
    }
    function init() {
        initializeElements();
        initializeEventListeners();
        fetchAndLoadOrders();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
