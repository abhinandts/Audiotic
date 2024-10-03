(async function () {
    let categoryDropdown, sortDropdown, currentPage = 1, totalPages;

    function initializeElements() {
        categoryDropdown = document.getElementById("category-dropdown");
        sortDropdown = document.getElementById("sort-dropdown");
    }

    function initializeEventListeners() {
        categoryDropdown.addEventListener("change", () => {
            currentPage = 1;
            fetchProducts();
        });
        sortDropdown.addEventListener("change", () => {
            currentPage = 1;
            fetchProducts();
        });
    }

    async function fetchProducts() {
        const category = categoryDropdown.value;
        const sort = sortDropdown.value;
        const query = new URLSearchParams({ categoryId: category, sortBy: sort, page: currentPage, limit: 6 }).toString();

        try {
            const response = await fetch(`/api/products?${query}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            updateProductList(data.products, data.totalProducts);
            updatePaginationControls(data.currentPage, data.totalPages);
            updateTotalProductCount(data.totalProducts);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    function updateProductList(products, totalProducts) {
        const productList = document.getElementById("product-list");
        productList.innerHTML = "";

        if (totalProducts === 0) {
            productList.innerHTML = "<div class='col-12'><p class='text-center'>No products available</p></div>";
            return;
        }

        products.forEach((product) => {
            const productHtml = `
                <div class="col-lg-3 col-md-4">
                    <div class="product-cart-wrap mb-30">
                        <div class="product-img-action-wrap">
                            <div class="product-img product-img-zoom">
                                <a href="/productPage?productId=${product._id}">
                                    <img class="default-img" src="/admin/productImages/${product.image[0]}" alt="no image" />
                                    <img class="hover-img" src="/admin/productImages/${product.image[0]}" alt="no image" />
                                </a>
                            </div>
                            <div class="product-badges product-badges-position product-badges-mrg">
                                <span class="hot">-30%</span>
                            </div>
                        </div>
                        <div class="product-content-wrap">
                            <div class="product-category">
                                <a href="shop-grid-right.html">${product.category.name}</a>
                            </div>
                            <h2><a href="/productPage?productId=${product._id}">${product.productName}</a></h2>
                            <div class="product-price">
                                <span>₹${product.price}</span>
                                <span class="old-price">₹${product.mrp}</span>
                            </div>
                            <div class="product-action-1 show">
                                <a aria-label="Add To Cart" class="action-btn hover-up" onclick="addToCart('${product._id}')">
                                    <i class="fi-rs-shopping-bag-add"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
            productList.insertAdjacentHTML("beforeend", productHtml);
        });
    }

    function updatePaginationControls(currentPage, totalPages) {
        const paginationArea = document.querySelector('.pagination-area .pagination');
        paginationArea.innerHTML = '';

        if (totalPages === 0) {
            paginationArea.style.display = 'none';
            return;
        }

        paginationArea.style.display = 'flex';

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="fetchProductsPage(${i})">${i}</a>`;
            paginationArea.appendChild(li);
        }
    }

    function updateTotalProductCount(totalProducts) {
        const totalProductElement = document.querySelector('.totall-product strong');
        if (totalProductElement) {
            totalProductElement.textContent = totalProducts;
        }
    }

    window.fetchProductsPage = function(page) {
        currentPage = page;
        fetchProducts();
    };

    function init() {
        initializeElements();
        initializeEventListeners();
        fetchProducts();
    }

    document.addEventListener("DOMContentLoaded", init);
})();