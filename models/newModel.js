const mongoose = require('mongoose');

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
        items: [
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
                priceAtPurchase: {  // Price at the time of purchase
                    type: Number,
                    required: true,
                },
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        shippingCost: {
            type: Number,
            default: 0,
        },







        orderPlacedAt: {
            type: Date,
            default: Date.now,
        },
        deliveryAddress: {
            fullName: { type: String, required: true },
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
            phoneNumber: { type: String, required: true }
        },
        reason: {  // Generalized for both cancellations and returns
            type: String,
            required: function () { return this.orderStatus === "Cancelled" || this.orderStatus === "Returned"; },
            default: ""
        },
        couponApplied: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            required: false,
        },
        couponDiscount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);