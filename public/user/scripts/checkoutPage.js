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

        const selectedPaymentMethodElement = document.querySelector('input[name="payment-option"]:checked');
        if (!selectedPaymentMethodElement) {
            showToast("Please select a payment method", "error");
            return;
        }
        const method = selectedPaymentMethodElement.value

        try {
            const orderData = {
                addressId: addressId,
                couponId: couponId,
                paymentMethod: method
            };

            const response = await fetch(`/api/checkout/placeOrder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {

                const responseData = await response.json();

                if (method === "Razorpay") {
                    initializeRazorpay(responseData);
                } else {
                    window.location.href = `/orders/orderConfirmation/${responseData.orderId}`;
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
            handler: function (response) {
                // Handle payment success
                console.log('Payment successful:', response);
                // Perform any necessary actions, such as updating the order status on the server
                verifyPayment(response, razorpayOrder)
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
            modal: {
                ondismiss: function () {
                    // This function is triggered when the payment modal is closed by the user or fails
                    console.log('Payment failed or dismissed.');
                    handlePaymentFailure(); // You can handle the failure here
                },
            }
        }
        const rzp1 = new Razorpay(options);
        rzp1.open();
    }

    function handlePaymentFailure() {
        // Define your logic here for handling failed payment
        console.log('Payment failed or canceled.');
        showToast('Payment failed, please try again.', 'error');
        // You can also redirect to a failure page or retry
    }

    async function verifyPayment(response, razorpayOrder) {

        const paymentDetails = {
            response, razorpayOrder
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
                    window.location.href = data.redirect;
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