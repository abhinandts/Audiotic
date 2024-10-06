const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
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
    offer: {
        type: Number,
        default: 0
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