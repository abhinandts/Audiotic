(function () {
    "use strict";

    let couponNameInput, couponValueInput, minimumAmountInput, createBtn, couponList, pageList, expiryDateInput;

    function initializeElements() {
        couponNameInput = document.getElementById('couponName');
        couponValueInput = document.getElementById('couponValue');
        minimumAmountInput = document.getElementById('minimumAmount');
        createBtn = document.getElementById('createBtn');
        couponList = document.getElementById('couponList');
        pageList = document.getElementById('pagination');
        expiryDateInput = document.getElementById('expiry-date');
    }

    function initializeEventListeners() {
        createBtn.addEventListener('click', validateForm);
        couponList.addEventListener('click', handleCouponClick);
    }

    function handleCouponClick(event) {
        if (event.target.classList.contains('disableButton')) {
            const couponId = event.target.getAttribute('data-id');
            disableCoupon(couponId)
        }
    }

    async function disableCoupon(couponId) {
        try {
            const response = await fetch('/admin/api/coupons/disableCoupon', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponId })
            });
            if (response.ok) {
                // await fetchAndLoadCoupons();
                window.location.reload();
            } else {
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
        if (!validateAmount(minimumAmount, couponValue)) return;

        let expiryDate = expiryDateInput.value;
        if (!validateExpiryDate(expiryDate)) return;

        try {
            const response = await fetch('/admin/api/coupons/createCoupon', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: couponName,
                    value: parseInt(couponValue),
                    minimumAmount: parseInt(minimumAmount),
                    expiryDate: new Date(expiryDate).toISOString()
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error creating coupon:', error);
                showError(createBtn, error.message || "Failed to create coupon");
            } else {
                const result = await response.json();
                console.log('Coupon created successfully:', result);
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            showError(createBtn, "An error occurred while creating the coupon");
        }
    }



    function validateExpiryDate(expiryDate) {
        const now = new Date();
        const minExpiryDate = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
        const inputDate = new Date(expiryDate);

        if (!expiryDate) {
            showError(expiryDateInput, "Please select an expiry date and time");
            return false;
        }

        if (isNaN(inputDate.getTime())) {
            showError(expiryDateInput, "Please enter a valid date and time");
            return false;
        }

        if (inputDate <= minExpiryDate) {
            showError(expiryDateInput, "Expiry date must be at least 5 minutes in the future");
            return false;
        }
        hideError(expiryDateInput);
        return true;
    }

    function validateAmount(minimumAmount, couponValue) {
        if (!/^\d+$/.test(minimumAmount) || parseInt(minimumAmount) <= 0) {

            showError(minimumAmountInput, "Please enter a valid positive integer for minimum amount");
            return false;
        }
        if (minimumAmount <= couponValue) {
            showError(minimumAmountInput, "Minimum amount should be greater than Coupon Value")
            showError(couponValueInput, "")
            return false;
        }
        hideError(minimumAmountInput);
        return true;
    }

    function validateCouponValue(value) {
        if (!/^\d+$/.test(value) || parseInt(minimumAmount) <= 0) {
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


    async function pagination(page = 1) {
        try {
            const response = await fetch(`/admin/api/coupons/fetchCoupons?page=${page}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch coupons');
            }
            const data = await response.json();

            updateCouponTable(data.coupons);
            updatePagination(data.currentPage, data.totalPages);

        } catch (error) {
            console.error("Client side error", error);
        }
    }

    function updatePagination(currentPage, totalPages) {
        pageList.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = createPageItem(i, currentPage);
            pageList.appendChild(pageItem);
        }
    }

    function createPageItem(page, currentPage) {
        const item = document.createElement('li');
        item.classList.add('page-item');
        if (page === currentPage) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <a class="page-link" href="#" data-page="${page}">${page}</a>
        `;
        item.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            pagination(page);
        });
        return item;
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
        const isExpired = new Date(coupon.expiryDate) <= new Date();
        couponItem.innerHTML = `
                                <td class="text-center">
                                    <div class="form-check">➤</div>
                                </td>
                                <td class="couponDetails">
                                    <a href="/admin/coupons/editCoupon/${coupon._id}" >
                                        <b>${coupon.name}</b>
                                    </a>
                                </td>
                                <td class="couponDetails">
                                    <a href="/admin/coupons/editCoupon/${coupon._id}">
                                        ₹${coupon.value}.00/-
                                    </a>
                                </td>
                                <td class="couponDetails">
                                    <a href="/admin/coupons/editCoupon/${coupon._id}" >
                                        ₹${coupon.minimumAmount}.00/-
                                    </a>
                                </td>
                                <td>
                                    <div class="col-lg-2 col-sm-2 col-4 col-status">
                                        <span class="badge rounded-pill ${isExpired ? 'alert-warning' : (coupon.is_active ? 'alert-success' : 'alert-danger')}">
                                            ${isExpired ? 'Expired' : (coupon.is_active ? 'Active' : 'Disabled')}
                                        </span>
                                    </div>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-sm font-sm btn-light rounded disableButton" data-id="${coupon._id}" ${isExpired ? 'disabled' : ''} >
                                         ${isExpired ? 'Expired' : (coupon.is_active ? '🔒 Disable' : '🔓 Enable')}
                                    </button>
                                </td>
                                `;
        return couponItem;
    }

    function init() {
        initializeElements();
        initializeEventListeners();
        // fetchAndLoadCoupons()
        pagination()
    }

    document.addEventListener('DOMContentLoaded', init);
})();