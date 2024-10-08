(function () {
    let coupons = [];
    let cartTable, wholeBody, cartSubtotalSpan, shippingCharge, totalSpan, checkoutBtn;
    let selectedCoupon = null;
    let currentCart = null;

    function initializeElements() {
        cartTable = document.getElementById('cartTableBody');
        wholeBody = document.getElementById('wholeBody');
        cartSubtotalSpan = document.getElementById('cartSubtotal');
        shippingCharge = document.getElementById('shippingCharge');
        totalSpan = document.getElementById('total');
        checkoutBtn = document.getElementById('proceedToCheckout')
    }

    function initializeEventListeners() {
        cartTable.addEventListener("click", handleCartBodyClick);
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    async function proceedToCheckout() {
        let checkoutUrl = '/checkout';

        if (selectedCoupon) {
            checkoutUrl += `?couponId=${selectedCoupon._id}`;
        }
        window.location.href = checkoutUrl;
    }

    function displayCoupons(fetchedCoupons) {
        coupons = fetchedCoupons;
        const couponList = document.querySelector('.couponList')
        couponList.innerHTML = "";
        coupons.forEach(coupon => {
            const couponElement = document.createElement('div');
            couponElement.className = 'couponItem ';
            couponElement.innerHTML = `
                        <input type="checkbox" id="${coupon._id}" class="col-md-2" name="coupon" value="${coupon._id}">
                        <label for="${coupon._id}" class="col-md-10">
                            ${coupon.name} - ₹${coupon.value} off on orders above ₹${coupon.minimumAmount}
                        </label>
            `;
            couponList.appendChild(couponElement);
        });

        couponList.addEventListener('change', handleCouponSelection);
    }


    function handleCouponSelection(event) {
        if (event.target.type === 'checkbox') {
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name="coupon"]');
            checkboxes.forEach(checkbox => {
                if (checkbox !== event.target) {
                    checkbox.checked = false;
                }
            });

            if (event.target.checked) {
                selectedCoupon = coupons.find(coupon => coupon._id === event.target.value);
            } else {
                selectedCoupon = null;
            }

            updateCartTotals(currentCart);
        }
    }

    async function fetchAndUpdateCart() {
        try {
            const [cartResponse, couponsResponse] = await Promise.all([
                fetch('/api/cart/getProducts'),
                fetch('/api/coupons/getCoupons')
            ]);

            if (!cartResponse.ok || !couponsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            currentCart = await cartResponse.json();
            const coupons = await couponsResponse.json();

            if (!currentCart || !currentCart.cartProducts || currentCart.cartProducts.length === 0) {
                showEmptyPage();
            } else {
                updateCartTable(currentCart.cartProducts);
                updateCartTotals(currentCart);
                displayCoupons(coupons);
            }
        } catch (error) {
            console.error("Error fetching data", error);
            showToast("Error fetching cart data", "error");
        }
    }

    function showEmptyPage() {
        wholeBody.innerHTML = "";
        wholeBody.innerHTML = `
                                <div class="text-center mb-200 mt-100">
                                    <h3>Your cart is empty</h3>
                                    <p class="mt-10">Please add some products to your cart.</p>
                                    <a href="/home" class="btn mt-15 ">Continue Shopping</a>
                                </div>
        `
    }
    function updateCartTable(cartProducts) {
        cartTable.innerHTML = "";
        cartProducts.forEach(element => {
            const productItem = createProductRow(element)
            cartTable.appendChild(productItem)
        });
    }
    function createProductRow(element) {
        const productRow = document.createElement('tr');
        productRow.className = 'productRow';
        productRow.innerHTML = `
                                    <td class="image product-thumbnail">
                                        <img src="/admin/productImages/${element.image}" alt="#">
                                    </td>
                                    <td class="product-des product-name">
                                        <h5 class="product-name">
                                            <a href="/productPage?productId=${element._id}">
                                                ${element.name}
                                            </a>
                                        </h5>
                                    </td>
                                    <td class="price" data-title="Price">
                                        <span>
                                            ₹${element.offerPrice.toLocaleString("en-IN")}
                                        </span>
                                    </td>
                                    <td class="text-center" data-title="Stock">
                                        <div class="detail-qty border radius  m-auto" style="display:flex; flex-direction: row; justify-content: center;">

                                            <button type="button" style="flex: 1; background: none; border: none; cursor: pointer; padding: 2px;" class="qty-down" data-product-id="${element._id}" aria-label="Decrease quantity">
                                                <i class="fi-rs-minus-small" aria-hidden="true"></i>
                                            </button>
    
                                            <span style="flex: 1; margin-left: 10%; margin-right: 10%;" class="qty-val">${element.quantity}</span>
    
                                            <button style="flex: 1; background: none; border: none; cursor: pointer; padding: 2px;" type="button" class="qty-up" data-product-id="${element._id}" aria-label="Increase quantity">
                                                <i class="fi-rs-plus-small" aria-hidden="true"></i>
                                            </button>

                                        </div>
                                    </td>
                                    <td class="text-right" data-title="Cart">
                                        <span class="subtotal" >₹ ${element.subtotal.toLocaleString("en-IN")}/- </span>
                                    </td>

                                     <td class="action" data-title="Remove">
                                        <a href="#" class="text-muted delete-product" data-product-id="${element._id}">
                                            <i class="fi-rs-trash"></i>
                                        </a>
                                    </td>

                                 `;
        return productRow;
    }

    function updateCartTotals(cart) {
        cartSubtotalSpan.textContent = `₹ ${cart.cartSubtotal.toLocaleString('en-IN')}/-`;
        shippingCharge.textContent = `₹ ${cart.shipping.toFixed(2)}/-`;

        let couponDiscount = 0;
        if (selectedCoupon && cart.cartSubtotal >= selectedCoupon.minimumAmount && cart.cartSubtotal > selectedCoupon.value) {
            couponDiscount = selectedCoupon.value;
        }

        const couponDiscountSpan = document.getElementById('couponDiscount')
        if (couponDiscountSpan) {
            couponDiscountSpan.textContent = `₹ ${couponDiscount.toFixed(2)}/-`;
        }

        const total = cart.cartSubtotal + cart.shipping - couponDiscount;
        totalSpan.textContent = `₹ ${total.toLocaleString("en-IN")}/-`;
    }

    function handleCartBodyClick(event) {

        if (event.target.closest('.qty-up')) {
            const productId = event.target.closest('.qty-up').getAttribute('data-product-id');
            const increment = true;
            updateQuantity(productId, increment, event.target.closest('.qty-up'));

        } else if (event.target.closest('.qty-down')) {
            const productId = event.target.closest('.qty-down').getAttribute('data-product-id');
            const increment = false;
            updateQuantity(productId, increment, event.target.closest('.qty-down'))
        }
        if (event.target.closest('.delete-product')) {
            event.preventDefault();
            const productId = event.target.closest('.delete-product').getAttribute('data-product-id');
            deleteProduct(productId);
        }
    }
    async function deleteProduct(productId) {

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to remove this product from the cart?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#0ac06e',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/cart/removeProduct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId })
                });

                if (!response.ok) {
                    throw new Error('Failed to remove product (response is not okay)');
                }

                const data = await response.json();
                console.log("Product deleted Successfully", data);

                await fetchAndUpdateCart();
                showToast("Product removed from cart", "success");

            } catch (error) {
                console.log("Error:", error);
                showToast("Failed to remove product", "error");
            }
        }
    }

    async function updateQuantity(productId, increment, button) {

        let row = button.closest('tr');
        let qtySpan = row.querySelector('.qty-val');

        if (!qtySpan) {
            console.error('Quantity span not found');
            return;
        }

        const currentQty = parseInt(qtySpan.textContent);

        if (increment && currentQty >= 5) {
            showToast('Maximum quantity reached', 'warning')
            return;
        }
        else if (!increment && currentQty <= 1) {
            showToast('Minimum quantity reached', 'warning')
            return;
        }

        try {
            const response = await fetch('/api/cart/updateQuantity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, increment })
            });

            const result = await response.json();

            if (!response.ok) {
                showToast(result.message, result.type || 'error')
                return;
            }

            qtySpan.textContent = result.quantity;

            showToast(result.message, result.type || 'success');
            await fetchAndUpdateCart();

        } catch (error) {
            console.error(error);
            showToast('Failed to update quantity', error);
        }
    }

    function init() {
        initializeElements();
        initializeEventListeners();
        fetchAndUpdateCart();
    }

    document.addEventListener('DOMContentLoaded', init);

    window.deleteProduct = deleteProduct;
})();