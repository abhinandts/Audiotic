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
            addToCart(productId);
        }
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();