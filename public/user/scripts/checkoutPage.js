(function () {

    let selectedAddress, addressList, placeOrderButton, cartTotalSpan;
    let couponId;

    function initializeElements() {
        addressList = document.getElementById('addressList');
        placeOrderButton = document.getElementById('placeOrder');
        cartTotalSpan = document.getElementById('cartTotal');

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

    function checkCartTotal() {
        console.log(cartTotalSpan.value)
        let cartTotal = cartTotalSpan.value
        if (cartTotal > 1000) {

        }
    }


    function selectAddress(addressCard) {
        if (selectedAddress) {
            selectedAddress.classList.remove('selected');
        }
        addressCard.classList.add('selected');
        selectedAddress = addressCard;
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

        const selectedPaymentMethod = document.querySelector('input[name="payment_option"]:checked');
        if (!selectedPaymentMethod) {
            showToast("Please select a payment method", "error");
            return;
        }
        const razorpay = selectedPaymentMethod.id === 'exampleRadios5' ? true : false;

        try {
            const orderData = {
                addressId: addressId,
                couponId: couponId,
                razorpay: razorpay
            };

            const response = await fetch(`/api/checkout/placeOrder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (response.ok) {
                console.log("Order Placed")

                if (razorpay) {
                    const razorpayOrder = await response.json();
                    initializeRazorpay(razorpayOrder);

                } else {
                    window.location.href = response.url;
                }
            } else {
                const errorData = await response.json()
                showToast(errorData.message, "error")
            }
        } catch (error) {
            console.error(error);
        }
    }

    function initializeRazorpay(razorpayOrder) {
        let orderDetails = razorpayOrder
        const options = {
            key: 'rzp_test_l5PYAz2fxdpeOD', // Replace with your Razorpay key ID
            amount: razorpayOrder.amount,
            currency: 'INR',
            name: 'AUDIOTIC',
            description: 'Payment for order',
            order_id: razorpayOrder.id,
            handler: function (response, order) {
                // Handle payment success
                console.log('Payment successful:', response);
                // Perform any necessary actions, such as updating the order status on the server
                verifyPayment(response, orderDetails)
            },
            prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: '9999999999',
            },
            notes: {
                address: 'Razorpay Corporate Office',
            },
            theme: {
                color: '#3399cc',
            },
        };
        const rzp1 = new Razorpay(options);
        rzp1.open();
    }

    function verifyPayment(response, orderDetails) {

        const paymentDetails = {
            response, orderDetails
        }
        return fetch('/api/checkout/verifyPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails)
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    console.log('Payment verified successfull')
                    window.location.href = `/orders/orderConfirmation/${orderDetails.receipt}`;
                } else {
                    console.log('Payment verification failed');
                    showToast('Payment verification failed', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred', 'error');
            });
    }

    function init() {
        initializeElements();
        initializeEventListeners();
        checkCartTotal()
    }

    document.addEventListener('DOMContentLoaded', init);

})();