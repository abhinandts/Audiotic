(function () {

    let tableBody,wholeTable;

    function initializeElements() {
        tableBody = document.getElementById('table-body')
        wholeTable = document.getElementById('whole-table')
    }

    function initializeEventListeners(){
        tableBody.addEventListener('click',handleClick)
    }

    function handleClick(event){
        if(event.target.classList.contains('product-row')){
            const orderId = event.target.getAttribute('data-id')
            showOrderPage(couponId)
        }
    }

    function showOrderPage(id){
        console.log(id)
    }

    async function fetchAndLoadOrders() {
        try {
            const response = await fetch('/api/myAccount/getOrders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders')
            }
            const orders = await response.json();
            updateOrdersTable(orders)

        } catch (error) {
            console.error(error)
        }
    }

    function updateOrdersTable(orders) {
        tableBody.innerHtml = ""
        orders.forEach(order => {
            const orderItem = createOrderItem(order);
            tableBody.append(orderItem);
        })
    }

    function createOrderItem(order) {
        const orderItem = document.createElement('tr');
        orderItem.className = 'product-row';
        orderItem.innerHTML = `
                                <td>${order.date}</td>
                                <td> <a href="/myAccount/getOrder/${order.orderId}" > ${order.orderId}</td>
                                <td>₹${order.totalPrice}</td>
                                <td>${order.status}</td>
        `
        return orderItem
    }

    function init() {
        initializeElements();
        initializeEventListeners();
        fetchAndLoadOrders();
    }
    document.addEventListener('DOMContentLoaded', init);
})()