const Address = require('../models/addressModel')

const addAddress = async (req, res) => {
    try {
        const { addressName, street, city, state, pinCode, country } = req.body;
        const newAddress = {
            addressName: addressName,
            street: street,
            city: city,
            state: state,
            pinCode: pinCode,
            country: country
        }
        const userId = req.session.userId

        const allAddress = await Address.findOne({ user: userId })

        if (allAddress) {
            if (allAddress.address.length < 4) {
                allAddress.address.push(newAddress)
                const value = await allAddress.save();
                res.status(201).send({ message: "New Address added" })
            } else {
                res.status(201).send({ message: "Address limit reached" });
            }
        } else {
            const address = new Address({
                user: userId,
                address: [newAddress]
            })
            await address.save()
            res.status(201).send({ message: "Address saved successfully" })
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).send({ error: "Failed to save address" })
    }
}

const getAddresses = async (req, res) => {
    try {
        const userAddresses = await Address.findOne({ user: req.session.userId });
        if (userAddresses) {
            res.status(200).json(userAddresses.address)
        } else {
            res.status(200).json([])
        }
    } catch (error) {
        res.status(400).json({ error: "Failed to fetch addresses" });
    }
}

const deleteAddress = async (req, res) => {

    try {
        const addressId = req.params.addressId; // Assuming you're passing the address ID as a URL parameter
        const userId = req.session.userId; // Assuming you have the user's ID from authentication middleware

        // Find the address document for the user
        const addressDoc = await Address.findOne({ user: userId });

        if (!addressDoc) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        // Find the index of the address to remove
        const addressIndex = addressDoc.address.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Remove the address from the array
        addressDoc.address.splice(addressIndex, 1);

        // Save the updated document
        await addressDoc.save();

        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while deleting the address" });
    }
}

const getEditAddress = async (req, res) => {
    try {
        const userId = req.session.userId
        const addressId = req.params.addressId

        const addressDoc = await Address.findOne({ user: userId });

        if (!addressDoc) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        const address = addressDoc.address.find(addr => addr._id.toString() === addressId)

        if (!address) {
            return res.status(404).json({ message: "Not address matched." })
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

const editAddress = async (req, res) => {
    try {
        const { addressName, street, city, state, pinCode, country, addressId } = req.body
        const address = { addressName, street, city, state, pinCode, country }
        const address_Id = addressId

        const userId = req.session.userId

        const addressDoc = await Address.findOne({ user: userId })

        if (!addressDoc) {
            return res.status(404).json({ message: "Not matching address found for this user" })
        }

        const addressIndex = addressDoc.address.findIndex(addr => addr._id.toString() == addressId)
        if (addressIndex === -1) {
            return res.status(404).json({ message: "Address not found" })
        }

        addressDoc.address[addressIndex] = {
            ...addressDoc.address[addressIndex],
            addressName,
            street,
            city,
            state,
            pinCode,
            country
        };
        await addressDoc.save()
        res.status(200).json({ message: "Address updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    addAddress,
    getAddresses,
    deleteAddress,
    getEditAddress,
    editAddress
}