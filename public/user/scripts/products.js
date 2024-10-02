(function () {

    let categoryList, productList;

    // Initialize HTML elements
    function initializeElements() {
        categoryList = document.getElementById('category-list');
        productList = document.getElementById('product-list');
    }

    // Initialize event listeners
    function initializeEventListeners() {
        // Toggle dropdown display on click
        document.querySelector('.sort-by-dropdown-wrap').addEventListener('click', function () {
            const dropdown = document.getElementById('category-dropdown');
            toggleDropdown(dropdown);
        });

        // Fetch categories when the page is loaded
        fetchCategories();
    }

    // Toggle dropdown display between block and none
    function toggleDropdown(dropdown) {
        if (dropdown.style.display === 'none' || !dropdown.style.display || dropdown.style.display === 'hidden') {
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    // Fetch categories from the server
    async function fetchCategories() {
        try {
            const response = await fetch('/api/products/getCategories');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();
            updateCategoryList(categories);
        } catch (error) {
            console.error(error.message);
        }
    }

    // Update the category list in the dropdown
    function updateCategoryList(categories) {
        categoryList.innerHTML = "";
        categories.forEach(category => {
            const categoryItem = createCategoryItem(category);
            categoryList.appendChild(categoryItem);
        });
    }

    // Create category list item
    function createCategoryItem(category) {
        const categoryItem = document.createElement('li');
        categoryItem.innerHTML = `<a href="#" data-category-id="${category._id}">${category.name}</a>`;
        categoryItem.addEventListener('click', (e) => {
            e.preventDefault();
            selectCategory(category._id);
        });
        return categoryItem;
    }

    // Fetch and display products for the selected category
    async function selectCategory(categoryId) {
        try {
            const response = await fetch(`/api/products/getProductsByCategory/${categoryId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const products = await response.json();
            displayProducts(products);

            // Hide the dropdown after selecting a category
            document.getElementById('category-dropdown').style.display = 'none';
        } catch (error) {
            console.error(error);
        }
    }

    // Display the products on the page
    function displayProducts(products) {
        productList.innerHTML = "";
        products.forEach(product => {
            const productItem = createProductCard(product);
            productList.appendChild(productItem);
        });
    }

    // Create a product card to display each product
    function createProductCard(product) {
        const productItem = document.createElement('div');
        productItem.className = "col-lg-3 col-md-4";
        productItem.innerHTML = `
            <div class="product-cart-wrap mb-30">
                <div class="product-img-action-wrap">
                    <div class="product-img product-img-zoom">
                        <a href="/productPage?productId=${product._id}">
                            <img class="default-img" src="/admin/productImages/${product.image[0]}" alt="">
                            <img class="hover-img" src="/admin/${product.image[0]}" alt="">
                        </a>
                    </div>
                    <div class="product-action-1"></div>
                </div>
                <div class="product-content-wrap">
                    <div class="product-category">
                        <a href="shop-grid-right.html">${product.category.name}</a>
                    </div>
                    <h2><a href="/productPage?productId=${product._id}">${product.productName}</a></h2>
                    <div class="product-price">
                        <span>₹${product.price} </span>
                        <span class="old-price">₹ ${product.mrp}</span>
                    </div>
                    <div class="product-action-1 show">
                        <a aria-label="Add To Cart" class="action-btn hover-up" onclick="addToCart('${product._id}')">
                            <i class="fi-rs-shopping-bag-add"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
        return productItem;
    }

    // Initialize the app
    function init() {
        initializeElements();
        initializeEventListeners();
    }

    init();

})();
