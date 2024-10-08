(function () {
    let cartCountIcon, wishlistCountIcon, searchField, searchResult;

    function initializeElements() {
        cartCountIcon = document.getElementById('cart-count')
        wishlistCountIcon = document.getElementById('wishlist-count')
        searchField = document.getElementById('search-field')
        searchResult = document.getElementById('search-result')
    }
    function initializeEventListeners() {
        searchField.addEventListener('input', handleSearch)
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

    async function handleSearch() {
        const query = searchField.value
        if (query.length > 0) {
            searchProducts(query)
        } else {
            searchResult.innerHTML = "";
        }
    }
    async function searchProducts(query) {
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            const products = await response.json();
            updateSearchResults(products)
        } catch (error) {
            console.error(error)
        }
    }
    function updateSearchResults(products) {
        searchResult.innerHTML = ""
        products.forEach(element => {
            const productItem = createProduct(element)
            searchResult.appendChild(productItem)
        });
    }
    function createProduct(product) {
        const productItem = document.createElement('div');
        productItem.classList.add('search-result-item'); // Add a class for styling
        productItem.innerHTML = `
            <div class="product-image">
                <img class="default-img" src="/admin/productImages/${product.image[0]}" alt="${product.productName}">
            </div>
            <div  class="product-info">
                <span class="product-name">${product.name}</span>
                <p class="product-price">Category: ${product.category.name}</p>
            </div>
        `;
        productItem.addEventListener('click', () => getProduct(product._id));
        return productItem;
    }

    async function getProduct(id) {
        try {
            const response = await fetch(`/productPage?productId=${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            window.location.href = response.url;
        } catch (error) {
            console.error(error)
        }
    }

    function init() {
        initializeElements()
        initializeEventListeners()
        fetchCartCount()
        fetchWishlistCount()
    }
    document.addEventListener('DOMContentLoaded', init)
})()