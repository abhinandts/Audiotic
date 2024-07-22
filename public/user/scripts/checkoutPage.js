
(function () {

    let selectedAddress, addressList, placeOrderButton;

    function initializeElements() {
        addressList = document.getElementById('addressList');
        placeOrderButton = document.getElementById('placeOrder');
    }

    function initializeEventListeners() {

        addressList.addEventListener('click', function (event) {
            const clickedCard = event.target.closest('.selectable-address');
            if (clickedCard) {
                selectAddress(clickedCard);
            }
        });
        placeOrderButton.addEventListener('click', placeOrder)
    }

    async function placeOrder() {
        if (!selectedAddress) {
            showToast("Please select an address before placing order", "error");
            return;
        }

        const addressId = selectedAddress.getAttribute('data-id');
        if (!addressId) {
            showToast("Selected address is invalid..", "warning");
            return;
        }
        try {
            const response = await fetch(`/api/orders/placeOrder/${addressId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                console.log("Order Placed")
                window.location.href = response.url;
            } else {
                const errorData = await response.json()
                throw new Error(errorData.messge || 'Failed to place order.')
            }
        } catch (error) {
            console.error(error);
        }
    }

    function selectAddress(addressCard) {
        if (selectedAddress) {
            selectedAddress.classList.remove('selected');
        }
        addressCard.classList.add('selected');
        selectedAddress = addressCard;
    }

    function showToast(message, type) {
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)";
                break;
            case 'error':
                backgroundColor = "linear-gradient(to right, #3498db, #2980b9)";
                break;
            case 'warning':
                backgroundColor = "linear-gradient(to right, #FFA500, #FFD700)";
                break;
            default:
                backgroundColor = "linear-gradient(to right, #3498db, #2980b9)";
                break;
        }
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);

})();