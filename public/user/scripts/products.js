(function () {

    let categoryList, productList;

    function initializeElements() {
        categoryList = document.getElementById('category-list')
        productList = document.getElementById('product-list')
    }

    async function fetchCategories() {
        try {
            const response = await fetch('/api/products/getCategories')

            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }
            const categories = await response.json();
            updateCategoryList(categories)

        } catch (error) {
            console.error(error.message)
        }
    }

    function updateCategoryList(categories) {
        try {
            categoryList.innerHTML = "";
            categories.forEach(cat => {
                const categoryItem = createCategoryItem(cat)
                categoryList.appendChild(categoryItem)
            })
        } catch (error) {
            console.error(error)
        }
    }
    function createCategoryItem(category) {
        const categoryItem = document.createElement('li');
        categoryItem.innerHTML = `<a href= "#" data-category-id="${category._id}"> ${category.name} </a>`;
        categoryItem.addEventListener('click', (e) => {
            e.preventDefault();
            selectCategory(category._id)
        })
        return categoryItem;
    }

    async function selectCategory(categoryId) {
        try {
            const response = await fetch(`/api/products/getProductsByCategory/${categoryId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            const products = await response.json()
            displayProducts(products)

        } catch (error) {
            console.error(error)
        }
    }
    function displayProducts(products) {
        try {
            productList.innerHTML = "";
            products.forEach(product => {
                const productItem = createProductCard(product)
                productList.appendChild(productItem)
            });
        } catch (error) {
            console.error(error)
        }
    }
    function createProductCard(product) {
        const productItem = document.createElement('div')
        productItem.className = "col-lg-3 col-md-4 "
        productItem.innerHTML = `

                            <div class="product-cart-wrap mb-30">
                                <div class="product-img-action-wrap">
                                    <div class="product-img product-img-zoom">
                                        <a href="/productPage?productId=${product._id}">
                                            <img class="default-img" src="/admin/productImages/${product.image[0]}"
                                                alt="">
                                            <img class="hover-img" src="/admin/${product.image[0]}" alt="">
                                        </a>
                                    </div>
                                    <div class="product-action-1">
                                        <!-- <a aria-label="View" class="action-btn hover-up" data-bs-toggle="modal"
                                    data-bs-target="#quickViewModal">
                                    <i class="fi-rs-search"></i></a>
                                <a aria-label="Add To Wishlist" class="action-btn hover-up"
                                    href="#"><i class="fi-rs-heart"></i></a> -->
                                    </div>
                                    <!-- <div class="product-badges product-badges-position product-badges-mrg">
                                <span class="hot">-30%</span>
                            </div> -->
                                </div>
                                <div class="product-content-wrap">
                                    <div class="product-category">
                                        <a href="shop-grid-right.html">
                                            ${product.category.name}
                                        </a>
                                    </div>
                                    <h2><a href="/productPage?productId=${product._id}">
                                            ${product.productName}
                                        </a></h2>
                                    <!-- <div class="rating-result" title="90%">
                                <span>
                                    <span>70%</span>
                                </span>
                            </div> -->
                                    <div class="product-price">
                                        <span>₹${product.price} </span>
                                        <span class="old-price">₹ ${product.mrp}</span>
                                    </div>
                                    <div class="product-action-1 show">
                                        <a aria-label="Add To Cart" class="action-btn hover-up"
                                            onclick="addToCart('${product._id}')"><i
                                                class="fi-rs-shopping-bag-add"></i></a>
                                    </div>
                                </div>
                            </div>
        `;
        return productItem

    }


    function init() {
        initializeElements()
        // initializeEventListeners()
        fetchCategories()
    }

    document.addEventListener('DOMContentLoaded', init);
})();