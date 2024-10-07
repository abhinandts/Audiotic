const Products = require("../models/productModel");
const Categories = require("../models/categoryModel");

const loadOffers = async (req, res) => {
    try {
        const products = await Products.find({ is_active: true }, { name: 1, offer: 1, image: { $slice: 1 } }).lean();
        const categories = await Categories.find({ is_active: true }, { name: 1, categoryOffer: 1 });

        const categoryWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Products.countDocuments({ category: category._id });

                return { ...category._doc, count };
            })
        );
        res.render("offersPage", {
            title: "Offers Page",
            products,
            categoryWithCount,
            header: true,
            sidebar: true,
            footer: true,
        });
    } catch (error) {
        console.error(error);
    }
};

const applyProductOffer = async (req, res) => {
    try {
        const { productIds, offer } = req.body;

        const parsedOffer = parseFloat(offer);
        if (isNaN(parsedOffer) || parsedOffer < 0 || parsedOffer > 100) {
            return res.status(400).json({ message: "Invalid offer percentage" });
        }

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "No products selected" });
        }

        const bulkOperations = productIds.map((id) => {
            return {
                updateOne: {
                    filter: { _id: id },
                    update: { $set: { offer: parsedOffer } },
                },
            };
        });

        const result = await Products.bulkWrite(bulkOperations);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "No products were updated" });
        }

        res.status(200).json({ message: "Offer applied to products successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const applyCategoryOffer = async (req, res) => {
    try {
        const { id, offer } = req.body;

        const updatedCategory = await Categories.findByIdAndUpdate(id, { $set: { categoryOffer: offer } }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Offer applied to category successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    loadOffers,
    applyProductOffer,
    applyCategoryOffer,
};