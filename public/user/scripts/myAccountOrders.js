(function () {

    let tableBody, form, orderIdInput, orderIdError;

    function initializeElements() {
        tableBody = document.getElementById('tableBody')
        form = document.getElementById('trackOrderForm')
        orderIdInput = document.getElementById('orderIdInput')
        orderIdError = document.getElementById('orderIdError')
    }
    function initEventListeners() {
        form.addEventListener('submit', handleForm);
    }

    function handleForm(event) {
        event.preventDefault();

        const orderId = orderIdInput.value.trim();

        if (orderId.length <= 6) {
            orderIdError.textContent = "Please provide valid Order Id"
            orderIdError.style.display = 'block';
            return
        }
        form.submit();
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
        orderItem.className = 'productRow';
        orderItem.innerHTML = `
                                <td>${order.date}</td>
                                <td>${order.orderId}</td>
                                <td>₹${order.totalPrice}</td>
                                <td>${order.status}</td>
        `
        return orderItem
    }

    function init() {
        initializeElements();
        initEventListeners();
        fetchAndLoadOrders();
    }
    document.addEventListener('DOMContentLoaded', init);
})();