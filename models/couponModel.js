const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    minimumAmount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    is_active: {
        type: Boolean,
        default: true
    }
},{
    timestamps:true
})

couponSchema.virtual('isExpired').get(function (){
    return this.expiryDate <= new Date();
})

module.exports = mongoose.model('Coupon', couponSchema)