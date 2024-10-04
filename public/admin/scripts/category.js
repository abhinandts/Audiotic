(async function () {
    console.log("scripts loaded");

    let nameInput, errorContainer, formElement, formValid;

    function initializeElements() {
        nameInput = document.getElementById('category-name');
        formElement = document.getElementById('form'); 

       
        errorContainer = document.createElement('div');
        nameInput.parentElement.appendChild(errorContainer);
    }

    function initializeEventListeners() {
        nameInput.addEventListener('blur', checkName);
        formElement.addEventListener('submit', handleFormSubmit);
    }

    async function checkName() {
        let name = nameInput.value.trim();

        formValid = false;

        if (!validateName(name)) {
            return;
        }

        try {
            let response = await fetch('/admin/api/category/checkName', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            let data = await response.json();

            if (data.exists) {
                displayError('Category name already exists');
                formValid = false; 
            } else {
                clearError();
                formValid = true;
            }
        } catch (error) {
            console.error('Error in checking category name:', error);
        }
    }

    function validateName(name) {
        clearError();

        if (name.length < 3) {
            displayError('Category name is too short');
            formValid = false;
            return false;
        }

        let regex = /^[a-zA-Z0-9 ]+$/;
        if (!regex.test(name)) {
            displayError("Use only letters, numbers, and spaces.");
            formValid = false;
            return false;
        }

        formValid = true;
        return true;
    }

    function handleFormSubmit(event) {
        if (!formValid) {
            event.preventDefault();
            console.log('Form submission prevented due to validation errors');
        }
    }

    function displayError(message) {
        errorContainer.textContent = message;
        errorContainer.style.color = 'red';
    }

    function clearError() {
        errorContainer.textContent = '';
    }

    function init() {
        initializeElements();
        initializeEventListeners();
    }

    document.addEventListener('DOMContentLoaded', init);
})();