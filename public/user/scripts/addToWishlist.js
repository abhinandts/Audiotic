(function () {

    let addToWishlistBtn, productIdInput;

    function initializeElements() {
        productIdInput = document.getElementById("productIdInput")
        addToWishlistBtn = document.getElementById('addToWishlist')
    }

    function initializeEventEmitters() {
        addToWishlistBtn.addEventListener('click', addToWishlist)
    }

    async function isProductInWishlist() {
        const productId = productIdInput.value
        try {
            const response = await fetch('/api/wishlist/isProductInWishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            })

            const data = await response.json()
            console.log(data)

            if (data) {
                addToWishlistBtn.style.display = 'none';
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function addToWishlist(event) {
        const productId = event.currentTarget.getAttribute('product-id');

        const result = await Swal.fire({
            title: 'Add to Wishlist',
            text: "Are you sure you want to add this product to your wishlist?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1bb21b',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, add it!'
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/wishlist/addProduct', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                });

                if (!response.ok) {
                    // Try to parse the response as JSON
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        console.error('Error parsing response as JSON:', e);
                        // If parsing fails, fall back to plain text
                        const errorText = await response.text();
                        console.error('Response text:', errorText);
                        alert('Server returned an error: ' + errorText);
                        return;
                    }

                    alert('Error: ' + (errorData.error || 'Unexpected error occurred'));
                    return;
                }

                const result = await response.json();

                Toastify({
                    text: result.message || "Product added to Wishlist!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                }).showToast();

                fetchWishlistCount()
                isProductInWishlist()


            } catch (error) {
                console.error('Fetch error:', error);

                Toastify({
                    text: error.message || "Failed to add product to wishlist",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
                }).showToast();
            }
        }
    }
    function init() {
        initializeElements()
        initializeEventEmitters()
        isProductInWishlist()
    }
    document.addEventListener('DOMContentLoaded', init)
})()

