(function () {
    'use strict';

    let walletDialogBtn, walletRechargeDialog, walletRechargeForm, walletDialogCloseBtn, rechargeAmountInput;

    function initializeElements() {
        walletDialogBtn = document.getElementById('wallet-recharge-dialog-btn');
        walletRechargeDialog = document.getElementById('wallet-recharge-dialog');
        walletRechargeForm = document.getElementById('wallet-recharge-form');
        walletDialogCloseBtn = document.getElementById('wallet-recharge-dialog-close-btn');
        rechargeAmountInput = document.getElementById('recharge-amount')
    }

    function initializeEventListeners() {
        walletDialogBtn.addEventListener('click', () => walletRechargeDialog.showModal());
        walletDialogCloseBtn.addEventListener('click', () => walletRechargeDialog.close());
        walletRechargeForm.addEventListener('submit', handleWalletRechargeForm);
    }

    async function handleWalletRechargeForm(e) {
        e.preventDefault();

        const rechargeAmount = rechargeAmountInput.value

        const response = await fetch('/api/myAccount/walletRecharge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rechargeAmount })
        })
        console.log(response)

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        if(response.ok){
            const responseData = await response.json();

            initializeRazorpay(responseData)
        }
    }


    function initializeRazorpay(razorpayOrder) {
        const options = {
            key: 'rzp_test_l5PYAz2fxdpeOD', 
            amount: razorpayOrder.amount,
            currency: 'INR',
            name: 'AUDIOTIC',
            description: 'Wallet recharge',
            order_id: razorpayOrder.id,
            handler: function (response) {
                // Handle payment success
                console.log('Payment successful:', response);
                // Perform any necessary actions, such as updating the order status on the server
                verifyPayment(response,razorpayOrder)
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

    async function verifyPayment(response, razorpayOrder) {

        const paymentDetails = {
            response, razorpayOrder
        }
        return fetch('/api/myAccount/wallet/verifyPayment', {
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
    }

    document.addEventListener('DOMContentLoaded', init);

})();