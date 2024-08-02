const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true
    },
    couponValue: {
        type: Number,
        required: true
    },
    minimumAmount:{
        type:Number,
        required:true
    },
    is_active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Coupon', couponSchema)