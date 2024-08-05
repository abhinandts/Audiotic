(function () {
    let cartCountIcon, wishlistCountIcon;

    function initializeElements() {
        cartCountIcon = document.getElementById('cart-count')
        wishlistCountIcon = document.getElementById('wishlist-count')
    }
    window.fetchCartCount = async function () {
        try {
            const response = await fetch('/api/cart/getCount');
            if (!response.ok) {
                throw new Error('Failed to fetch cart count');
            }
            const cartCount = await response.json()
            updateCartCount(cartCount)

        } catch (error) {
            console.error(error)
        }
    }
    window.updateCartCount = function (count) {
        cartCountIcon.textContent = count
    }

    window.fetchWishlistCount = async function () {
        try {
            const response = await fetch('/api/wishlist/getCount');
            if (!response.ok) {
                throw new Error('Failed to fetch wishlist count');
            }
            const wishlistCount = await response.json()
            updateWishlistCount(wishlistCount)

        } catch (error) {
            console.error(error)
        }
    }
    window.updateWishlistCount = function (count) {
        wishlistCountIcon.textContent = count
    }

    function init() {
        initializeElements();
        fetchCartCount()
        fetchWishlistCount()
    }
    document.addEventListener('DOMContentLoaded', init)
})()