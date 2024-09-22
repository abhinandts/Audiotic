const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productSpecifications: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
    },
    image: {
        type: Array,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Product', productSchema)