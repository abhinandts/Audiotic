window.addToCart = async function (productId) {
    const confirmation = await confirmAddToCart();

    if (confirmation) {
        try {
            const response = await addProductToCart(productId);
            await handleCartResponse(response);
        } catch (error) {
            handleCartError(error);
        }
    }
};

// Helper Functions

async function confirmAddToCart() {
    const result = await Swal.fire({
        title: 'Add to Cart',
        text: "Are you sure you want to add this product to your cart?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1bb21b',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, add it!'
    });

    return result.isConfirmed;
}

async function addProductToCart(productId) {
    return fetch('/api/cart/addToCart', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
    });
}

async function handleCartResponse(response) {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            console.error('Error parsing response as JSON:', e);
            const errorText = await response.text();
            showToast(errorText, 'error');
            return;
        }
        showToast(errorData.message, 'error');
        return;
    }

    const result = await response.json();
    showToast(result.message || "Product added to cart successfully!", 'success');
    fetchCartCount();
    fetchWishlistCount();
}

function handleCartError(error) {
    console.error('Fetch error:', error);
    showToast(error.message || "Failed to add product to cart", 'error');
}