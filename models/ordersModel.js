const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
            }
        ],
        orderTotal: {
            type: Number,
            default: 0,
        },
        shipping: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: [
                "Processing",
                "Shipped",
                "Out for delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Processing"
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        address: {
            type: Object,
            required: false
        },
        reason: {
            type: String,
            required: false,
            default: ""
        }
    }
)

module.exports = mongoose.model("Orders", orderSchema);