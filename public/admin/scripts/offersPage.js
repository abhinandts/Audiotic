(function () {
    let productList, productOfferInput, productOfferForm;
    let categoryList, selectedCategory, categoryOfferInput, categoryOfferForm;
    let selectedProductIds = new Set();

    function initializeElements() {
        productList = document.getElementById("product-list");
        productOfferInput = document.getElementById("product-offer");
        productOfferForm = document.getElementById("product-offer-form");
        categoryList = document.getElementById("category-list");
        categoryOfferInput = document.getElementById("category-offer");
        categoryOfferForm = document.getElementById("category-offer-form");
    }

    function initializeEventListeners() {
        productList.addEventListener("click", function (event) {
            const clickedCard = event.target.closest(".selectable-product");

            if (clickedCard) {
                toggleProductSelection(clickedCard);
            }
        });
        productOfferForm.addEventListener("submit", productFormSubmit);

        categoryList.addEventListener("click", function (event) {
            const clickedCategory = event.target.closest(".selectable-category");

            if (clickedCategory) {
                toggleCategorySelection(clickedCategory);
            }
        });
        categoryOfferForm.addEventListener("submit", categoryFormSubmit);
    }

    async function categoryFormSubmit(event) {
        event.preventDefault();

        if (!selectedCategory) {
            return alert("Please select a category");
        }

        if (!categoryOfferInput.value) {
            return alert("Please provide valid offer percentage");
        }
        try {
            const categoryId = selectedCategory.getAttribute("data-id");

            const response = await fetch("/admin/api/offers/categoryOffer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: categoryId,
                    offer: categoryOfferInput.value,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to apply offer");
            }

            const result = await response.json();
            showToast(result.message,"success")

            location.reload();
        } catch (error) {
            showToast(error,"error")
        }
    }

    function toggleCategorySelection(categoryCard) {
        if (selectedCategory && selectedCategory !== categoryCard) {
            selectedCategory.classList.remove("selected");
        }

        if (selectedCategory === categoryCard) {
            categoryCard.classList.remove("selected");
            selectedCategory = null;
        } else {
            selectedCategory = categoryCard;
            categoryCard.classList.add("selected");
        }
    }

    async function productFormSubmit(event) {
        event.preventDefault();

        if (selectedProductIds.size === 0) {
            return alert("please select products");
        }
        if (!productOfferInput.value) {
            return alert("Please enter discount percentage");
        }

        try {
            const response = await fetch("/admin/api/offers/productOffer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productIds: Array.from(selectedProductIds),
                    offer: productOfferInput.value,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to apply discount");
            }

            const result = await response.json();

            location.reload();
            showToast(result.message,"success")
        } catch (error) {
            showToast(error,"error");
        }
    }

    function toggleProductSelection(productCard) {
        const productId = productCard.getAttribute("data-id");

        if (selectedProductIds.has(productId)) {
            selectedProductIds.delete(productId);
            productCard.classList.remove("selected");
        } else {
            selectedProductIds.add(productId);
            productCard.classList.add("selected");
        }
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }
    document.addEventListener("DOMContentLoaded", init);
})();