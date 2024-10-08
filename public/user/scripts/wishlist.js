(function () {

    let wishlistTable, wishlistProducts, wholeBody;

    function initializeElements() {
        wishlistTable = document.getElementById('wishlistTableBody')
        wholeBody = document.getElementById('wholeBody')
    }

    function initializeEventListeners() {
        wishlistTable.addEventListener('click', handleWishlistTableClick)
    }

    function handleWishlistTableClick(event) {
        if (event.target.closest('.deleteProduct')) {
            const productId = event.target.closest('.deleteProduct').getAttribute('dataProductId');
            deleteProduct(productId);
        } else if (event.target.closest('.add-to-cart-btn')) {
            const productId = event.target.closest('.add-to-cart-btn').getAttribute('data-product-id');
            addToCart(productId)
        }
    }
    async function deleteProduct(productId) {
        event.preventDefault();

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to remove this product from the Wishlist?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#0ac06e',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/wishlist/removeProduct', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                });

                if (!response.ok) {
                    throw new Error("Failed to remove product");
                }
                const data = await response.json()
                console.log("Product deleted", data);

                await fetchAndUpdateWishlist();
                showToast("Product is removed from your wishlist", "success")
                fetchCartCount()
                fetchWishlistCount()

            } catch (error) {
                console.error(error);
                showToast("Failed to remove product", "error")
            }
        }
    }

    async function fetchAndUpdateWishlist() {
        try {
            const response = await fetch('/api/wishlist/getProducts')

            if (!response) {
                throw new Error('Failed to fetch data');
            }

            wishlistProducts = await response.json()
            console.log(wishlistProducts)

            if (!wishlistProducts || !wishlistProducts.products || wishlistProducts.products.length == 0) {
                showEmptyPage();
            } else {
                updateWishlist(wishlistProducts.products)
            }
            updateWishlist(wishlistProducts.products)

        } catch (error) {
            console.error("Error fetching data", error)
        }
    }

    function updateWishlist(products) {
        console.log(products)
        wishlistTable.innerHTML = "";
        products.forEach(element => {
            const productItem = createProductRow(element)
            wishlistTable.appendChild(productItem)
        });
    }
    function createProductRow(element) {
        const productRow = document.createElement('tr');
        productRow.className = 'productRow';

        let stockStatus, buttonState;
        if (element.product.stock > 0) {
            stockStatus = '<span class="text-success font-weight-bold">In stock</span>';
            buttonState = '';
        } else {
            stockStatus = '<span class="text-danger font-weight-bold">Out of stock</span>';
            buttonState = 'disabled';
        }

        productRow.innerHTML = `
                                <td class="image"><img src="/admin/productImages/${element.product.image[0]}" alt="#"></td>
                                <td class="product-des">
                                    <h5 class="product-name"><a href="/productPage?productId=${element.product._id}">${element.product.name} </a></h5>
                                     <p class="font-xs"></p>
                                </td>
                                <td class="price" data-title="Price">
                                    <span>₹ ${element.product.price}.00 </span>
                                </td>
                                <td class="text-center" data-title="Stock">
                                    ${stockStatus}
                                </td>
                                <td class="text-right" data-title="Cart">
                                    <button class="btn btn-sm add-to-cart-btn ${buttonState} " data-product-id="${element.product._id}"  >
                                       Add to Cart
                                    </button>
                                </td>

                                <td class="action" data-title="Remove">
                                    <a href="#" class = "text-muted deleteProduct" dataProductId="${element.product._id}">
                                        <i class="fi-rs-trash"></i>
                                    </a>
                                </td>
                            `;
        return productRow;
    }

    function showEmptyPage() {
        wholeBody.innerHTML = "";
        wholeBody.innerHTML = `
                                <div class="text-center mb-200 mt-100">
                                    <h3>Your wishlist is empty</h3>
                                    <p class="mt-10">Please add some products to your Wishlist💖.</p>
                                    <a href="/home" class="btn mt-15 ">Continue Shopping</a>
                                </div>
                            `
    }

    function init() {
        initializeElements();
        initializeEventListeners();
        fetchAndUpdateWishlist();
    }
    document.addEventListener("DOMContentLoaded", init)
})()