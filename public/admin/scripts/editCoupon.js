(function () {
    'use strict';

    let couponNameInput, couponValueInput, minimumAmountInput, editCouponForm;
    let couponNameError, couponValueError, minimumAmountError, couponNameMessage;
    let originalCouponName;

    function initializeElements() {
        couponNameInput = document.getElementById('coupon-name');
        couponValueInput = document.getElementById('couponValue');
        minimumAmountInput = document.getElementById('minimumAmount');
        editCouponForm = document.getElementById('edit-coupon-form');
        couponNameError = document.getElementById('coupon-name-error');
        couponValueError = document.getElementById('coupon-value-error');
        minimumAmountError = document.getElementById('minimum-amount-error');
        couponNameMessage = document.getElementById('coupon-name-message');
        originalCouponName = couponNameInput.value;
    }

    function initializeEventListeners() {
        editCouponForm.addEventListener('submit', validateForm);
        couponNameInput.addEventListener('input', checkCouponName);
    }

    function showError(element, errorElement, message) {
        element.classList.add('red-input');
        errorElement.textContent = message;
    }

    function clearError(element, errorElement) {
        element.classList.remove('red-input');
        errorElement.textContent = '';
    }

    function checkCouponName() {
        const couponName = couponNameInput.value.trim();
        if (couponName.length > 4) {
            if (couponName === originalCouponName) {
                couponNameMessage.textContent = '';
                return;
            }
            if (couponName) {
                fetch(`/admin/api/coupons/checkName?name=${encodeURIComponent(couponName)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.exists) {
                            couponNameMessage.textContent = 'This coupon name already exists.';
                            couponNameMessage.className = 'message error';
                        } else {
                            couponNameMessage.textContent = 'This coupon name is available.';
                            couponNameMessage.className = 'message success';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        couponNameMessage.textContent = 'An error occurred while checking the coupon name.';
                        couponNameMessage.className = 'message error';
                    });
            } else {
                couponNameMessage.textContent = '';
            }
        }else{
            couponNameMessage.textContent = 'Name should have atleast 4 characters';
            couponNameMessage.className = 'message error';
        }

    }

    function validateForm(e) {
        e.preventDefault();

        let isValid = true;

        // Clear all previous errors
        clearError(couponNameInput, couponNameError);
        clearError(couponValueInput, couponValueError);
        clearError(minimumAmountInput, minimumAmountError);

        if (!couponNameInput.value.trim()) {
            showError(couponNameInput, couponNameError, 'Coupon name is required');
            isValid = false;
        } else if (couponNameMessage.textContent.includes('already exists')) {
            showError(couponNameInput, couponNameError, 'Please choose a different coupon name');
            isValid = false;
        }

        const couponValue = parseFloat(couponValueInput.value);
        if (isNaN(couponValue) || couponValue <= 0) {
            showError(couponValueInput, couponValueError, 'Coupon value must be a positive number');
            isValid = false;
        }

        const minimumAmount = parseFloat(minimumAmountInput.value);
        if (isNaN(minimumAmount) || minimumAmount <= 0) {
            showError(minimumAmountInput, minimumAmountError, 'Minimum amount must be a positive number');
            isValid = false;
        }

        if (couponValue > minimumAmount) {
            showError(couponValueInput, couponValueError, 'Coupon value cannot be greater than minimum amount');
            showError(minimumAmountInput, minimumAmountError, 'Minimum amount must be greater than coupon value');
            isValid = false;
        }

        if (isValid) {
            editCouponForm.submit();
        }
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();