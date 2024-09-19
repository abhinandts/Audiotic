(function () {

    let form, orderIdInput, orderIdError;

    function initializeElements() {
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

    function init() {
        initializeElements();
        initEventListeners();
    }
    document.addEventListener('DOMContentLoaded', init);
})();