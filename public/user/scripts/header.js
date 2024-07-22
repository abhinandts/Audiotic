(function (){
    let cartCountIcon;
    
    function initializeElements(){
        cartCountIcon = document.getElementById('cart-count')
    }
    window.fetchCartCount = async function(){
        try {
            const response = await fetch('/api/cart/getCartCount');
            if(!response.ok){
                throw new Error('Failed to fetch cart count');
            }
            const cartCount = await response.json()
            updateCartCount(cartCount)

        } catch (error) {
            console.log(error)
        }
    }
    window.updateCartCount = function (cartCount){
        cartCountIcon.textContent = cartCount
    }

    function init(){
        initializeElements();
        fetchCartCount()
    }
    document.addEventListener('DOMContentLoaded',init)
})()