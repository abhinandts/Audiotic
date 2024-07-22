(function () {
    let productList;

    function initializeElements() {
        productList = document.getElementById('productList');
    }

    function initializeEventListeners() {
        productList.addEventListener('click', handleProductListClick);
    }

    function handleProductListClick(event) {
        const addToCartButton = event.target.closest('.addToCartButton');
        if (addToCartButton) {
            const productId = addToCartButton.getAttribute('data-id');
            confirmAddToCart(productId);
        }
    }

    function confirmAddToCart(productId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to add this product to cart",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0ac06e',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Add'
        }).then((result) => {
            if (result.isConfirmed) {
                addToCart(productId);
            }
        });
    }

    function updateCartCountDisplay() {
        if (typeof updateCartCount === 'function') {
            fetchCartCount();
        }
    }

    async function addToCart(productId) {
        try {
            const response = await fetch('/api/addToCart', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const result = await response.json();
            showToast(result.message || "Product added to cart successfully!", 'success');
            updateCartCountDisplay();

        } catch (error) {
            console.error('Fetch error:', error);
            showToast(error.message || "Failed to add product to cart", 'error');
        }
    }


    function showToast(message, type = 'info') {
        const backgroundColors = {
            success: "linear-gradient(to right, #00b09b, #96c93d)",
            error: "linear-gradient(to right, #ff5f6d, #ffc371)",
            warning: "linear-gradient(to right, #ff5f6d, #ffc371)",
            info: "linear-gradient(to right, #3498db, #2980b9)"
        };

        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: backgroundColors[type] || backgroundColors.info,
        }).showToast();
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();