(function () {

    let imageInput, originalFileName, fileType, cropperModel, cropper, saveCropBtn, cancelCropBtn;

    function initializeElements() {
        imageInput = document.getElementById('image-input');
        cropperModel = document.getElementById('cropper-modal');
        saveCropBtn = document.getElementById('save-crop-btn');
        cancelCropBtn = document.getElementById('cancel-crop-btn');
    }

    function initializeEventListeners() {
        imageInput.addEventListener('change', onImageInputChange);
        saveCropBtn.addEventListener('click', onSaveCrop);
        cancelCropBtn.addEventListener('click', closeCropperModal);
    }

    function onSaveCrop() {
        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 450
        });

        canvas.toBlob(function (blob) {
            const timeStamp = new Date().getDate.getTime();
            const newFileName = `cropped_${timeStamp}.${fileType}`;

            const croppedFile = new File([blob], newFileName, { type: blob.type });

            updateFileInput(croppedFile);

            closeCropperModal();

        }, `image/${fileType}`)
    }

    function updateFileInput(croppedFile) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(croppedFile);
        imageInput.files = dataTransfer.files;
    }

    function closeCropperModal() {
        cropperModel.style.display = 'none';
        if (cropper) {
            cropper.destroy();
        }
    }

    function onImageInputChange(event) {
        const file = event.target.files[0]

        if (file) {
            originalFileName = file.split('.').slice(0, -1).join(".");
            fileType = file.split('/')[1];

            const reader = new FileReader()

            reader.onload = function (e) {
                openCropperModel(e.target.result)
            }
            reader.readAsDataURL(file);
        }
    }

    function openCropperModel(imageSrc) {
        image.src = imageSrc;
        cropperModel.style.display = "flex";

        cropper = new Cropper(image, {
            aspectRatio: 16 / 9,
            viewMode: 1,
            autoCropArea: 0.5,
        });
    }

    function init() {
        initializeElements()
        initializeEventListeners()
    }

    document.addEventListener('DOMContentLoaded', init())
})()