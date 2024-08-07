
(function () {

    let selectedAddress, addressList, placeOrderButton;
    let couponId;

    function initializeElements() {
        addressList = document.getElementById('addressList');
        placeOrderButton = document.getElementById('placeOrder');

        const urlParams = new URLSearchParams(window.location.search);
        couponId = urlParams.get('couponId');
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
            const orderData = {
                addressId: addressId,
                couponId: couponId
            };

            const response = await fetch(`/api/orders/placeOrder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (response.ok) {
                console.log("Order Placed")
                window.location.href = response.url;
            } else {
                const errorData = await response.json()
                showToast(errorData.message, "error")
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

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);

})();