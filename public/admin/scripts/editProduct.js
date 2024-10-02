
(function () {
    "use strict";

    let imageInput, nameInput, mrpInput, discountInput, priceInput, errorElement, previewContainer;
    let maxImages = 5;
    let existingImages = document.querySelectorAll('.form-check-input:checked').length; // Track existing images on the page
    const croppedImages = new DataTransfer();
    let hintShown = false; // To track if the hint has been shown

    function initializeElements() {
        imageInput = document.getElementById("image-input");
        nameInput = document.getElementById("product-name");
        mrpInput = document.getElementById('mrp');
        discountInput = document.getElementById('discount');
        priceInput = document.getElementById('price');
        errorElement = document.getElementById('imageError');
        previewContainer = document.getElementById('input-upload');
        updateImageInputState();
    }

    function initializeEventListeners() {
        mrpInput.addEventListener('input', calculatePrice);
        discountInput.addEventListener('input', calculatePrice);
        imageInput.addEventListener("change", onImageInputChange);
        document.querySelectorAll('.form-check-input').forEach(checkbox => {
            checkbox.addEventListener('change', onCheckboxChange);
        });
        form.addEventListener('submit', function (e) {
            priceInput.disabled = false;
            if (croppedImages.files.length < maxImages && existingImages + croppedImages.files.length < maxImages) {
                e.preventDefault();
                alert("Please finish cropping all images before submitting the form.");
            }
        });
    }

    function calculatePrice() {
        const mrp = parseFloat(document.getElementById('mrp').value);
        const discount = parseFloat(document.getElementById('discount').value);
        if (!isNaN(mrp) && !isNaN(discount)) {
            const discountedPrice = mrp - (mrp * (discount / 100));
            priceInput.value = discountedPrice.toFixed();
        } else {
            priceInput.value = '';
        }
    }

    function onCheckboxChange() {
        existingImages = document.querySelectorAll('.form-check-input:checked').length;
        updateImageInputState();
    }

    function updateImageInputState() {
        const totalImages = existingImages + croppedImages.files.length;
        if (totalImages >= maxImages) {
            imageInput.disabled = true;
            errorElement.textContent = "You have reached the maximum limit of 5 images.";
            errorElement.style.display = "block";
        } else {
            imageInput.disabled = false;
            errorElement.style.display = "none";
        }
    }

    function onImageInputChange(event) {
        const files = event.target.files;
        const totalImages = existingImages + files.length;

        if (totalImages > maxImages) {
            errorElement.textContent = `You can only upload ${maxImages - existingImages} more images.`;
            errorElement.style.display = "block";
            imageInput.value = "";
            return;
        }

        errorElement.style.display = "none";
        previewContainer.innerHTML = "";

        if (files.length > 0) {
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
        const imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.classList.add("img-thumbnail", "preview-img");
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        imgElement.style.objectFit = "cover";
        imgElement.style.marginRight = "10px";

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
                <div class="hint" style="margin-bottom: 10px; font-size: 14px; color: grey;">
                    Click and drag to adjust the crop area. Double-click to reset the crop.
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

        cropperModal.style.display = "flex"; // Ensure modal is visible

        const saveCropButton = cropperModal.querySelector(".save-crop");
        saveCropButton.addEventListener("click", function () {
            saveCroppedImage(cropper, file, cropperModal);
        });

        const cancelCropButton = cropperModal.querySelector(".cancel-crop");
        cancelCropButton.addEventListener("click", function () {
            cropper.destroy();
            cropperModal.remove();
        });

        // Show hint only once
        if (!hintShown) {
            const hintElement = cropperModal.querySelector(".hint");
            hintElement.style.display = "block";
            hintShown = true; // Ensures hint is only shown once
        } else {
            const hintElement = cropperModal.querySelector(".hint");
            hintElement.style.display = "none"; // Hide hint if it's already been shown once
        }
    }

    function saveCroppedImage(cropper, originalFile, cropperModal) {
        cropper.getCroppedCanvas({
            width: 1160,
            height: 1160,
        }).toBlob(function (blob) {
            const newFile = new File([blob], originalFile.name, { type: originalFile.type });
            croppedImages.items.add(newFile);
            imageInput.files = croppedImages.files;

            cropper.destroy();
            cropperModal.remove();
            updateImageInputState();
        });
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener("DOMContentLoaded", init);
})();

