// addressManager.js

(function () {
    'use strict';

    let dialog, openDialogButton, cancelButton, addAddressForm, addressList, cancelEditButton, editDialog, editAddressForm;
    let addressCount = 0;

    function initializeElements() {
        dialog = document.getElementById('addAddressDialog');
        openDialogButton = document.getElementById('openDialogButton');
        cancelButton = document.getElementById('cancelDialogButton');
        addAddressForm = document.getElementById('addAddressForm');
        addressList = document.getElementById('addressList');
        cancelEditButton = document.getElementById('cancelEditDialogButton');
        editDialog = document.getElementById('editAddressDialog');
        editAddressForm = document.getElementById('editAddressForm');
    }

    function initEventListeners() {
        openDialogButton.addEventListener('click', handleAddressClick);
        cancelButton.addEventListener('click', closeDialog);
        addAddressForm.addEventListener('submit', handleAddAddressForm);
        addressList.addEventListener('click', handleAddressListClick);
        cancelEditButton.addEventListener('click', closeEditDialog);
        editAddressForm.addEventListener('submit', handleEditAddressForm)
    }

    //validation
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[data-validate]');
        let isValid = true;

        inputs.forEach(input => {
            const value = input.value.trim();
            const validationType = input.getAttribute('data-validate');
            const errorMessage = input.getAttribute('data-error');

            let inputIsValid = true;

            switch (validationType) {
                case 'notEmpty':
                    inputIsValid = value !== '';
                    break;
                case 'pincode':
                    inputIsValid = /^\d{6}$/.test(value);
                    break;
            }

            if (!inputIsValid) {
                isValid = false;
                showInputError(input, errorMessage);
            } else {
                clearInputError(input);
            }
        });

        return isValid;
    }



    function showInputError(input, message) {
        clearInputError(input); // Clear any existing error first

        const errorElement = document.createElement('div');
        errorElement.textContent = message;
        errorElement.className = 'error-message';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8em';
        errorElement.style.marginTop = '4px';

        input.parentNode.insertBefore(errorElement, input.nextSibling);
        input.style.borderColor = 'red';
    }

    function clearInputError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        input.style.borderColor = '';
    }


    function handleAddressClick() {
        if (addressCount < 4) {
            dialog.showModal();
        } else {
            showToast("You can only add upto 4 Address", "warning")
        }
    }

    function closeDialog() {
        if (dialog instanceof HTMLDialogElement) {
            dialog.close();
        } else {
            console.error('Dialog is not defined or not an HTMLDialogElement');
        }
    }
    function closeEditDialog() {
        if (editDialog instanceof HTMLDialogElement) {
            editDialog.close();
        } else {
            console.error('Edit Dialog is not defined')
        }
    }

    async function handleAddAddressForm(e) {
        e.preventDefault();

        if (!validateForm(e.target)) {
            return; // Stop if validation fails
        }

        const formData = new FormData(e.target);
        const addressData = Object.fromEntries(formData.entries());


        try {
            const response = await fetch('/api/myAccount/addAddress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            showToast(result.message, 'success');

            closeDialog();
            await fetchAndUpdateAddresses();
        } catch (error) {
            console.error('Error:', error);
            showToast('Error saving address: ' + error.message, 'error');
        }
    }
    async function handleEditAddressForm(e) {
        e.preventDefault();


        if (!validateForm(e.target)) {
            return; // Stop if validation fails
        }


        const formData = new FormData(e.target);
        const addressData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/myAccount/editAddress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData)
            })

            if (!response) {
                throw new Error('Failed to update Address')
            }

            const result = await response.json()

            showToast(result.message, "success")
            closeEditDialog()

            await fetchAndUpdateAddresses()

        } catch (error) {
            showToast('Error updating address:' + error.message, 'error')
        }
    }

    async function fetchAndUpdateAddresses() {
        try {
            const response = await fetch('/api/myAccount/getAddresses');
            if (!response.ok) {
                throw new Error('Failed to fetch addresses');
            }
            const addresses = await response.json();
            updateAddressList(addresses);

        } catch (error) {
            console.log('Error fetching addresses:', error);
        }
    }

    function updateAddressList(addresses) {
        addressList.innerHTML = "";
        addresses.forEach(address => {
            const addressItem = createAddressItem(address);
            addressList.appendChild(addressItem);
        });
    }

    function createAddressItem(address) {
        const addressItem = document.createElement('div');
        addressItem.className = 'col-lg-6 mb-2';
        addressItem.innerHTML = `
            <div class="card mb-3 mb-lg-0 selectable-address" data-id="${address._id}">

                <div class="card-header">
                    <h5 class="mb-0">${address.addressName}</h5>
                </div>
                <div class="card-body">
                    <address>
                        ${address.street}<br>
                        ${address.city}, ${address.state}<br>
                        ${address.pinCode}<br>
                        ${address.country}
                    </address>
                    <p>City: ${address.city}</p><br>
        <button type="button" class="btn btn-fill-out hover-up deleteAddress" data-id="${address._id}" style="background-color: white; border-color: GREEN; color: green;">Delete</button>
                    <button type="button" class="btn btn-fill-out hover-up editAddress" address-id="${address._id}">Edit</button>

                </div>
            </div>
        `;
        return addressItem;
    }

    function handleAddressListClick(event) {
        if (event.target.classList.contains('deleteAddress')) {
            const addressId = event.target.getAttribute('data-id');
            confirmDeleteAddress(addressId);
        } else if (event.target.classList.contains('editAddress')) {
            const addressId = event.target.getAttribute('address-id');
            editAddress(addressId);
        }
    }

    async function editAddress(addressId) {
        try {
            const response = await fetch(`/api/myAccount/editAddress/${addressId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch address');
            } else {
                const address = await response.json()
                openEditModal(address)
            }

        } catch (error) {
            showToast("Error editing address", 'error')
        }
    }

    function openEditModal(address) {
        const dialog = document.getElementById('editAddressDialog');
        const form = document.getElementById('editAddressForm');

        // Populate form fields
        form.addressName.value = address.addressName;
        form.street.value = address.street;
        form.city.value = address.city;
        form.state.value = address.state;
        form.pinCode.value = address.pinCode;
        form.country.value = address.country;

        // Add a hidden input for the address ID
        let hiddenInput = form.querySelector('input[name="addressId"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'addressId';
            form.appendChild(hiddenInput);
        }
        hiddenInput.value = address._id;

        // Show the dialog
        dialog.showModal();
    }

    function confirmDeleteAddress(addressId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this address?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#0ac06e',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteAddress(addressId);
            }
        });
    }

    async function deleteAddress(addressId) {
        try {
            const response = await fetch(`/api/myAccount/deleteAddress/${addressId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                showToast("Address deleted", 'success');
                await fetchAndUpdateAddresses();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete address');
            }
        } catch (error) {
            console.log("Error deleting address:", error);
            showToast("Error deleting address", 'error');
        }
    }

    function showToast(message, type) {
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)";
                break;
            case 'error':
                backgroundColor = "linear-gradient(to right, #3498db, #2980b9)";
                break;
            case 'warning':
                backgroundColor = "linear-gradient(to right, #ff5f6d, #ffc371)";
                break;
            default:
                backgroundColor = "linear-gradient(to right, #3498db, #2980b9)";
        }
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
    }

    function init() {
        initializeElements();
        initEventListeners();
        fetchAndUpdateAddresses();
    }

    document.addEventListener('DOMContentLoaded', init);
})();