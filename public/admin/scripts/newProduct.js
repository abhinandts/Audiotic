(function () {
    "use strict";

    let imageInput, nameInput, mrpInput, discountInput, priceInput, errorElement, previewContainer;

    const croppedImages = new DataTransfer();

    function initializeElements() {
        imageInput = document.getElementById("image-input");
        nameInput = document.getElementById("productName");
        mrpInput = document.getElementById('mrp')
        discountInput = document.getElementById('discount')
        priceInput = document.getElementById('price')
        errorElement = document.getElementById('imageError');
        previewContainer = document.getElementById('input-upload')
    }

    function initializeEventListeners() {
        mrpInput.addEventListener('input', calculatePrice);
        discountInput.addEventListener('input', calculatePrice);
        imageInput.addEventListener("change", onImageInputChange);
        nameInput.addEventListener('blur', checkName);
        form.addEventListener('submit', function () {
            priceInput.disabled = false;
        });
    }

    function calculatePrice() {

        const mrp = parseFloat(document.getElementById('mrp').value);
        const discount = parseFloat(document.getElementById('discount').value)

        if (!isNaN(mrp) && !isNaN(discount)) {
            const discountedPrice = mrp - (mrp * (discount / 100))
            priceInput.value = discountedPrice.toFixed()
        } else {
            priceInput.value = ''
        }
    }

    async function checkName() {
        const productName = nameInput.value;
        const response = await fetch(`/admin/api/product/checkName?name=${encodeURI(productName)}`)

        const result = await response.json();

        if (response.status === 409) {
            const errorElement = document.getElementById("nameError");
            errorElement.textContent = result.message;
            errorElement.style.display = "block";

            nameInput.classList.add("is-invalid");
        } else {
            const errorElement = document.getElementById("nameError");
            errorElement.textContent = "";
            errorElement.style.display = "none";

            nameInput.classList.remove("is-invalid");
        }
    }

    function onImageInputChange(event) {
                    // imageInput.value = "";

        const files = event.target.files;

        if (files.length > 5) {
            errorElement.textContent = `You can only upload 5 images`
            errorElement.style.display = "block";
            imageInput.value = "";
            return;
        }

        errorElement.style.display = "none";

        previewContainer.innerHTML = "";

        if (files.length > 0) {
            // Process each file for cropping
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    displayImagePreview(e.target.result);
                    handleImageCropping(e.target.result, file, index);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    function displayImagePreview(imageSrc) {
        // Create an image element to show the preview
        const imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.classList.add("img-thumbnail", "preview-img");
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        imgElement.style.objectFit = "cover";
        imgElement.style.marginRight = "10px";

        // Append the image element to the preview container
        previewContainer.appendChild(imgElement);
    }


    function handleImageCropping(imageSrc, file, index) {
        const cropperModal = document.createElement("div");
        cropperModal.classList.add("modal");

        cropperModal.innerHTML = `
            <div class="modal-content">
                <div class="img-container">
                    <img src="${imageSrc}" />
                </div>
                <button type="button" class="btn btn-success save-crop">Save Crop</button>
                <button type="button" class="btn btn-danger cancel-crop">Cancel</button>
            </div>
        `;

        document.body.appendChild(cropperModal);

        const imageElement = cropperModal.querySelector("img");
        const cropper = new Cropper(imageElement, {
            aspectRatio: 1 / 1,
            viewMode: 1,
            autoCropArea: 1,
        });

        const saveCropButton = cropperModal.querySelector(".save-crop");
        saveCropButton.addEventListener("click", function () {
            saveCroppedImage(cropper, file, cropperModal);
        });

        const cancelCropButton = cropperModal.querySelector(".cancel-crop");
        cancelCropButton.addEventListener("click", function () {
            cropper.destroy();
            cropperModal.remove();
        });

        cropperModal.style.display = "flex";
    }

    function saveCroppedImage(cropper, originalFile, cropperModal) {
        cropper
            .getCroppedCanvas({
                width: 1160,
                height: 1160,
            })
            .toBlob(function (blob) {
                const newFile = new File([blob], originalFile.name, { type: originalFile.type });
                croppedImages.items.add(newFile); // Add to cropped images
                imageInput.files = croppedImages.files; // Update the input field with all cropped images

                // Close modal and clean up
                cropper.destroy();
                cropperModal.remove();
            });
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener("DOMContentLoaded", init);
})();