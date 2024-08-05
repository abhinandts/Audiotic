(function (){

    let wishlistTable,wishlistProducts,wholeBody;

    function initializeElements (){
        wishlistTable = document.getElementById('wishlistTableBody')
        wholeBody = document.getElementById('wholeBody')
    }

    async function fetchAndUpdateWishlist(){
        try {
            const response = await fetch('/api/wishlist/getProducts')

            if(!response){
                throw new Error('Failed to fetch data');
            }

            wishlistProducts = await response.json()
            console.log(wishlistProducts)

            if(!wishlistProducts || !wishlistProducts.products || wishlistProducts.products.length ==0){
                showEmptyPage();
            }else{
                updateWishlist(wishlistProducts.products)
            }
            updateWishlist(wishlistProducts.products)

        } catch (error) {
            console.error("Error fetching data",error)
        }
    }

    function updateWishlist(products){
        console.log(products)
        wishlistTable.innerHTML = "";
        products.forEach(element => {
            const productItem = createProductRow(element)
            wishlistTable.appendChild(productItem)
        });
    }
    function createProductRow(element){
        const productRow = document.createElement('tr');
        productRow.className = 'productRow';
        productRow.innerHTML = `
                                <td class="image"><img src="/admin/productImages/${element.product.image[0]}" alt="#"></td>
                                <td class="product-des">
                                    <h5 class="product-name"><a href="#">${element.product.productName} </a></h5>
                                     <p class="font-xs"></p>
                                </td>
                                <td class="price" data-title="Price">
                                    <span>₹ ${element.product.price}.00 </span>
                                </td>
                                <td class="text-center" data-title="Stock">
                                    <span class="text-success font-weight-bold">In stock</span>
                                </td>
                                <td class="text-right" data-title="Cart">
                                    <button class="btn btn-sm ">
                                       Add to Cart
                                    </button>
                                </td>
                                <td class="action" data-title="Remove"><a href="#"><i class="fi-rs-trash"></i></a></td>
                            `;
                            return productRow;
    }


    function showEmptyPage (){
        wholeBody.innerHTML ="";
        wholeBody.innerHTML = `
                                <div class="text-center mb-200 mt-100">
                                    <h3>Your wishlist is empty</h3>
                                    <p class="mt-10">Please add some products to your Wishlist💖.</p>
                                    <a href="/home" class="btn mt-15 ">Continue Shopping</a>
                                </div>
                            `
    }

    function init(){
        initializeElements();
        // initializeEventListeners();
        fetchAndUpdateWishlist();
    }
    document.addEventListener("DOMContentLoaded",init)
} )()