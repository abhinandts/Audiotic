(function () {
    let nameInput, nameErrorSpan, imageInput, imageInputSpan, previewContainer,form;
    let croppedImages = new DataTransfer();
    let imageQueue = [];
    let currentIndex = 0;

    function initializeElements() {
        nameInput = document.getElementById('name');
        nameErrorSpan = document.getElementById('name-error');
        imageInput = document.getElementById('image');
        imageInputSpan = document.getElementById('image-error');
        previewContainer = document.getElementById('preview-container');
        form = document.getElementById('form')
    }

    function initializeEventListeners() {
        nameInput.addEventListener('blur', checkName);
        imageInput.addEventListener('change', checkImage);
        form.addEventListener('submit',checkValidation);
    }

    function checkValidation(event){
        const nameError = nameErrorSpan.style.display === 'block';
        const imageError = imageInputSpan.style.display === 'block' || croppedImages.files.length ===0;

        if(nameError || imageError){
            event.preventDefault();
            alert("please make sure all fields are valid")
        }
    }

    async function checkImage(event) {
        imageInputSpan.style.display = "none";
        previewContainer.innerHTML = "";

        const files = event.target.files;
        if (files.length > 5) {
            imageInputSpan.style.display = "block";
            return;
        }

        croppedImages = new DataTransfer(); 
        imageQueue = Array.from(files);
        currentIndex = 0;

        cropNextImage();
    }

    function cropNextImage() {
        if (currentIndex < imageQueue.length) {
            const file = imageQueue[currentIndex];
            const reader = new FileReader();

            reader.onload = function (e) {
                handleImageCropping(e.target.result, file);
            };

            reader.readAsDataURL(file);
        } else {
            displayImagePreviews();
        }
    }

    function handleImageCropping(imageSrc, originalFile) {
        const cropperModal = document.createElement("div");
        cropperModal.classList.add("modal");
        cropperModal.style.display = "flex";

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

        cropperModal.querySelector(".save-crop").addEventListener("click", function () {
            saveCroppedImage(cropper, originalFile, cropperModal);
        });

        cropperModal.querySelector(".cancel-crop").addEventListener("click", function () {
            cropper.destroy();
            cropperModal.remove();
            currentIndex++; 
            cropNextImage(); 
        });
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
            currentIndex++; 
            cropNextImage();
        });
    }

    function displayImagePreviews() {
        previewContainer.innerHTML = ""; 
        const files = croppedImages.files;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgElement = document.createElement("img");
                imgElement.src = e.target.result;
                imgElement.classList.add("img-thumbnail", "preview-img");
                imgElement.style.width = "100px";
                imgElement.style.height = "100px";
                imgElement.style.objectFit = "cover";
                imgElement.style.marginRight = "10px";
                previewContainer.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        });
    }

    async function checkName() {
        let name = nameInput.value.trim();

        if (!(/^[A-Za-z0-9\s]+$/.test(name))) {
            displayError("Only letters, numbers, and spaces are allowed.");
            return;
        }
        let currentId = document.getElementById('product-Id') ? document.getElementById('product-id').value : null ;

        try {
            const response = await fetch('/admin/api/product/checkName',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({name,currentId})
            });
            const result = await response.json();
            if (result.exists) {
                displayError(result.message);
            } else {
                displayError("");                
            }
        } catch (error) {
            console.error(error);
            displayError("Error checking product name.");

        }
    }

    function displayError(message) {
        nameErrorSpan.textContent = message;
        nameErrorSpan.style.display = message ? 'block' : 'none';
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();