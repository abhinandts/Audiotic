const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    cartProducts: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                default: 1
            },
            subtotal: {
                type: Number,
                required: true
            }
        }
    ],
    cartSubtotal: {
        type: Number,
        required: false,
        default: 0
    },
    shipping: {
        type: Number,
        required: false,
        default: 500
    },
    cartTotal: {
        type: Number,
        required: false,
        default: 0
    }
},
    {
        strictPopulate: false
    })

module.exports = mongoose.model("Cart", cartSchema);