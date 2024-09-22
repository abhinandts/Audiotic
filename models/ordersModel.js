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
        couponApplied: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            required: false,
        },
        couponDiscount: {
            type: Number,
            default: 0
        },
        shipping: {
            type: Number,
            default: 0
        },
        orderTotal: {
            type: Number,
            default: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["Cash on Delivery", "Razorpay", "Wallet"],
            required: true
        },
        orderStatus: {
            type: String,
            enum: ["Processing", "Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
            default: "Processing",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Refunded", "Failed", "Not Applicable"],
            default: "Pending",
        },
        address: {
            type: Object,
            required: false
        },
        reason: {
            type: String,
            required: function () { return this.orderStatus === "Cancelled" || this.orderStatus === "Returned"; },
            default: ""
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Orders", orderSchema);