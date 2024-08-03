(function () {
    "use strict";

    let couponNameInput, couponValueInput, minimumAmountInput, createBtn, couponList;

    function initializeElements() {
        couponNameInput = document.getElementById('couponName');
        couponValueInput = document.getElementById('couponValue');
        minimumAmountInput = document.getElementById('minimumAmount');
        createBtn = document.getElementById('createBtn');
        couponList = document.getElementById('couponList')
    }

    function initializeEventListeners() {
        createBtn.addEventListener('click', validateForm);
        couponList.addEventListener('click',handleCouponClick);
    }

    function handleCouponClick(event){
        if(event.target.classList.contains('disableButton')){
            const couponId = event.target.getAttribute('data-id');
            disableCoupon(couponId)
        }
    }

    async function disableCoupon(couponId){
        try {
            const response = await fetch('/admin/api/coupons/disableCoupon',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({couponId})

            });
            if(response.ok){
                await fetchAndLoadCoupons();
            }else{
                const errorData = await response.json()
                console.log(errorData)
            }
        } catch (error) {
            console.error(error)
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
                showError(couponNameInput, error.message || "Failed to create coupon");
            } else {
                const result = await response.json();
                console.log('Coupon created successfully:', result);
                fetchAndLoadCoupons()
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
        if (!/^\d+$/.test(value)|| parseInt(minimumAmount) <= 0) {
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

    async function fetchAndLoadCoupons() {
        try {
            const response = await fetch("/admin/api/coupons/fetchCoupons");
            if (!response.ok) {
                throw new Error('Failed to fetch coupons');
            }
            const coupons = await response.json();
            updateCouponTable(coupons)

        } catch (error) {
            console.error("client side error:", error)
        }
    }
    function updateCouponTable(coupons) {

        couponList.innerHTML = "";
        coupons.forEach(coupon => {
            const couponItem = createCouponItem(coupon);
            couponList.appendChild(couponItem)

        });
    }
    function createCouponItem(coupon) {
        const couponItem = document.createElement('tr');
        couponItem.innerHTML = `
                                        <td class="text-center ">
                                            <div class="form-check">➤
                                            </div>
                                        </td>
                                        <td><b>
                                                ${coupon.couponName}  
                                            </b></td>
                                        <td>
                                            ₹${coupon.couponValue}.00/-
                                        </td>
                                        <td>
                                            ₹${coupon.minimumAmount}.00/-
                                        </td>
                                        <td>
                                            <div class="col-lg-2 col-sm-2 col-4 col-status">
                                                    <span class="badge rounded-pill ${coupon.is_active ? 'alert-success' : 'alert-danger'}">${coupon.is_active ? 'Active' : 'Disabled'}</span>
                                            </div>
                                        </td>
                                        <td class="text-end">
                                            <button class="btn btn-sm font-sm btn-light rounded disableButton" data-id="${coupon._id}">
                                                ${coupon.is_active ? '🔒 Disable' : '🔓Enable'}
                                            </button>
                                          </td>
                                `;
        return couponItem;
    }

    function init() {
        initializeElements();
        initializeEventListeners();
        fetchAndLoadCoupons()
    }

    document.addEventListener('DOMContentLoaded', init);
})();