(function () {
    "use strict";

    let couponNameInput, couponValueInput, minimumAmountInput, createBtn;

    function initializeElements() {
        couponNameInput = document.getElementById('couponName');
        couponValueInput = document.getElementById('couponValue');
        minimumAmountInput = document.getElementById('minimumAmount');
        createBtn = document.getElementById('createBtn');
    }

    function initializeEventListeners() {
        createBtn.addEventListener('click', validateForm);
        couponNameInput.addEventListener('input', checkCouponName)
    }

    async function checkCouponName() {
        let couponName = couponNameInput.value.trim()
        if (!validateCouponName(couponName)) return;

        try {
            const response = await fetch('/admin/api/coupons/checkCouponName', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ couponName })
            })
            if (!response.ok) {
                const error = await response.json();
                showError(couponNameInput, error.message || "Coupon name check failed")
                return false;
            } else {
                hideError(couponNameInput)
            }
        } catch (error) {
            console.error(error);
            showError(couponNameInput, "An error occurred while checking the coupon name");
            return false;
        }
    }

    async function validateForm() {

        let couponName = couponNameInput.value.trim();
        if (!validateCouponName(couponName)) return;

        let couponValue = couponValueInput.value.trim();
        if (!validateCouponValue(couponValue)) return;

        let minimumAmount = minimumAmountInput.value.trim();
        if (!validateAmount(minimumAmount)) return;

        try {
            const response = await fetch('/admin/api/coupons/createCoupon', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ couponName, couponValue, minimumAmount })
            })

            if (!response.ok) {
                const error = await response.json();
                console.error('Error creating coupon:', error);
                // Handle error (e.g., show error message to the user)
                showError(createBtn, error.message || "Failed to create coupon");
            } else {
                const result = await response.json();
                console.log('Coupon created successfully:', result);
                // You can also display a success message or redirect the user
            }

        } catch (error) {
            console.error(error)
            showError(createBtn, "An error occurred while creating the coupon");

        }
    }

    function validateAmount(minimumAmount) {
        if (!/^\d+$/.test(minimumAmount) || parseInt(minimumAmount) <= 0) {
            showError(minimumAmountInput, "Please enter a valid positive integer for minimum amount");
            return false;
        }
        hideError(minimumAmountInput);
        return true;
    }

    function validateCouponValue(value) {
        if (!/^\d+$/.test(value)) {
            showError(couponValueInput, "Please enter a valid positive integer for coupon value");
            return false;
        }
        hideError(couponValueInput);
        return true;
    }

    function validateCouponName(coupon) {
        if (coupon.length < 5) {
            showError(couponNameInput, "Coupon name needs at least 5 characters");
            return false;
        }
        hideError(couponNameInput);
        return true;
    }

    function showError(inputElement, message) {
        hideError(inputElement);
        inputElement.classList.add('red-input');

        let errorElement = document.createElement('div');
        errorElement.style.color = 'red';
        errorElement.textContent = message;

        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }

    function hideError(inputElement) {
        inputElement.classList.remove('red-input');
        let nextElement = inputElement.nextSibling;
        if (nextElement && nextElement.style && nextElement.style.color === 'red') {
            nextElement.parentNode.removeChild(nextElement);
        }
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();