// // (function () {

// //     let trackOrderForm, orderIdInput, orderId, resultDiv;

// //     function initializeElements() {
// //         trackOrderForm = document.getElementById('trackOrderForm');
// //         resultDiv = document.getElementById('orderTrackingResult')
// //         orderIdInput = document.getElementById('orderIdInput')
// //     }
// //     function initializeEventListeners() {
// //         trackOrderForm.addEventListener('submit', trackOrder)
// //     }

// //     async function trackOrder(event) {
// //         event.preventDefault();
// //         orderId = orderIdInput.value.trim();

// //         if (!orderId) {
// //             resultDiv.innerHTML = '<h1>Please enter valid orderId</h1>'
// //             return;
// //         }

// //         const response = await fetch(`/api/myAccount/trackOrders/${orderId}`)
// //     }

// //     function init() {
// //         initializeElements();
// //         initializeEventListeners();
// //     }

// //     document.addEventListener('DOMContentLoaded', init);
// // })();


// (function () {
//     let trackOrderForm, orderIdInput, orderId, resultDiv, orderModal, cancelModal, cancelOrderBtn, submitCancelBtn, cancelReason;

//     function initializeElements() {
//         trackOrderForm = document.getElementById('trackOrderForm');
//         resultDiv = document.getElementById('orderTrackingResult');
//         orderIdInput = document.getElementById('orderIdInput');
//         orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
//         cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
//         cancelOrderBtn = document.getElementById('cancelOrderBtn');
//         submitCancelBtn = document.getElementById('submitCancelBtn');
//         cancelReason = document.getElementById('cancelReason');
//     }

//     function initializeEventListeners() {
//         trackOrderForm.addEventListener('submit', trackOrder);
//         cancelOrderBtn.addEventListener('click', showCancelModal);
//         submitCancelBtn.addEventListener('click', submitCancellation);
//     }

//     async function trackOrder(event) {
//         event.preventDefault();
//         orderId = orderIdInput.value.trim();

//         if (!orderId) {
//             resultDiv.innerHTML = '<h1>Please enter valid orderId</h1>';
//             return;
//         }

//         try {
//             const response = await fetch(`/api/myAccount/trackOrders/${orderId}`);
//             if (!response.ok) throw new Error('Failed to fetch order');
//             const order = await response.json();
//             displayOrderDetails(order);
//         } catch (error) {
//             resultDiv.innerHTML = `<h1>Error: ${error.message}</h1>`;
//         }
//     }

//     function displayOrderDetails(order) {
//         const modalBody = document.getElementById('orderModalBody');
//         modalBody.innerHTML = `
//             <p><strong>Order ID:</strong> ${order.orderId}</p>
//             <p><strong>Status:</strong> ${order.status}</p>
//             <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
//             <p><strong>Total Items:</strong> ${order.products.length}</p>
//             <p><strong>Order Total:</strong> $${(order.orderTotal / 100).toFixed(2)}</p>
//             <h6>Products:</h6>
//             <ul>
//                 ${order.products.map(product => `
//                     <li>${product.quantity} x Product ID: ${product.product} - $${(product.price / 100).toFixed(2)}</li>
//                 `).join('')}
//             </ul>
//         `;
//         orderModal.show();
//     }

//     function showCancelModal() {
//         orderModal.hide();
//         cancelModal.show();
//     }

//     async function submitCancellation() {
//         const reason = cancelReason.value.trim();
//         if (!reason) {
//             alert('Please provide a reason for cancellation');
//             return;
//         }

//         try {
//             const response = await fetch(`/api/myAccount/cancelOrder/${orderId}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ reason }),
//             });

//             if (!response.ok) throw new Error('Failed to cancel order');

//             alert('Order cancellation request submitted successfully');
//             cancelModal.hide();
//             location.reload(); // Refresh the page to reflect the changes
//         } catch (error) {
//             alert(`Error: ${error.message}`);
//         }
//     }

//     function init() {
//         initializeElements();
//         initializeEventListeners();
//     }

//     document.addEventListener('DOMContentLoaded', init);
// })();


(function () {
    let trackOrderForm, orderIdInput, orderId, resultDiv, orderModal, cancelModal, cancelOrderBtn, submitCancelBtn, cancelReason;

    function initializeElements() {
        trackOrderForm = document.getElementById('trackOrderForm');
        resultDiv = document.getElementById('orderTrackingResult');
        orderIdInput = document.getElementById('orderIdInput');
        orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
        cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
        cancelOrderBtn = document.getElementById('cancelOrderBtn');
        submitCancelBtn = document.getElementById('submitCancelBtn');
        cancelReason = document.getElementById('cancelReason');
    }

    function initializeEventListeners() {
        trackOrderForm.addEventListener('submit', trackOrder);
        cancelOrderBtn.addEventListener('click', showCancelModal);
        submitCancelBtn.addEventListener('click', submitCancellation);
    }

    async function trackOrder(event) {
        event.preventDefault();
        orderId = orderIdInput.value.trim();

        if (!orderId) {
            resultDiv.innerHTML = '<h1>Please enter a valid Order ID</h1>';
            return;
        }

        try {
            const response = await fetch(`/api/myAccount/trackOrders/${orderId}`);
            if (!response.ok) throw new Error('Failed to fetch order');
            const order = await response.json();
            displayOrderDetails(order);
        } catch (error) {
            resultDiv.innerHTML = `<h1>Error: ${error.message}</h1>`;
        }
    }

    function displayOrderDetails(order) {
        const modalBody = document.getElementById('orderModalBody');
        modalBody.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Total Items:</strong> ${order.products.length}</p>
            <p><strong>Order Total:</strong> $${(order.orderTotal / 100).toFixed(2)}</p>
            <h6>Products:</h6>
            <ul>
                ${order.products.map(product => `
                    <li>${product.quantity} x Product ID: ${product.product} - $${(product.price / 100).toFixed(2)}</li>
                `).join('')}
            </ul>
        `;
        orderModal.show();
    }

    function showCancelModal() {
        orderModal.hide();
        cancelModal.show();
    }

    async function submitCancellation() {
        const reason = cancelReason.value.trim();
        if (!reason) {
            alert('Please provide a reason for cancellation');
            return;
        }

        try {
            const response = await fetch(`/api/myAccount/cancelOrder/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) throw new Error('Failed to cancel order');

            alert('Order cancellation request submitted successfully');
            cancelModal.hide();
            location.reload(); // Refresh the page to reflect the changes
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
