

(function() {
    'use strict';

    let nameInput, originalName, mobileInput, nameError, mobileError;

    function initializeElements() {
        nameInput = document.getElementById('name');
        originalName = nameInput.value.trim();
        mobileInput = document.getElementById('mobile');
        nameError = document.getElementById('nameError');
        mobileError = document.getElementById('mobileError');

        nameInput.addEventListener('blur', handleNameBlur);
        mobileInput.addEventListener('blur', validateMobile);
    }

    async function handleNameBlur() {
        const trimmedName = this.value.trim();
        this.value = trimmedName;
        if (trimmedName !== originalName) {
            await checkName();
        }
    }

    async function checkName() {
        const name = nameInput.value.trim();

        if (name.length < 3) {
            nameError.textContent = 'Username must be at least 3 characters long.';
            nameError.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/myAccount/checkName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.exists) {
                nameError.textContent = 'Username already taken.';
                nameError.style.display = 'block';
            } else {
                nameError.style.display = 'none';
            }

        } catch (error) {
            console.error('Error:', error);
        }
    }

    function validateMobile() {
        const mobile = mobileInput.value.trim();
        const mobileRegex = /^\d{10}$/;

        if (!mobileRegex.test(mobile)) {
            mobileError.textContent = 'Phone number must be 10 digits.';
            mobileError.style.display = 'block';
        } else {
            mobileError.style.display = 'none';
        }
    }

    async function validateAndUpdateUser() {
        const name = nameInput.value.trim();
        const mobile = mobileInput.value.trim();

        // Validate username
        if (name.length < 3) {
            nameError.textContent = 'Username must be at least 3 characters long.';
            nameError.style.display = 'block';
            return;
        }

        // Validate mobile
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            mobileError.textContent = 'Phone number must be 10 digits.';
            mobileError.style.display = 'block';
            return;
        }

        // If validation passes, proceed with update
        const result = await Swal.fire({
            title: 'Update Profile',
            text: "Are you sure you want to Save changes",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1bb21b',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, add it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/myAccount/checkName', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: name })
                });

                const data = await response.json();

                if (data.exists) {
                    showToast("Please choose a different username.", 'warning');
                    return;
                }

                const updateResponse = await fetch('/api/myAccount/updateAccountDetails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: name, mobile: mobile })
                });

                const updateData = await updateResponse.text();
                showToast(updateData, 'success');
            } catch (error) {
                console.log('Error: ', error);
                showToast("An error occurred while updating account details.", 'error');
            }
        }
    }

    function init() {
        initializeElements();
    }

    document.addEventListener('DOMContentLoaded', init);

    // Expose validateAndUpdateUser to global scope if needed
    window.validateAndUpdateUser = validateAndUpdateUser
})();