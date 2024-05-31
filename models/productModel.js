const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productSpecifications: {
        type: String,
        require: true
    },
    mrp: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    stock: {
        type: Number,
        require: true
    },
    image: {
        type: Array,
        require: true
    }, category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
})
module.exports = mongoose.model('Product', productSchema)




// category:{
//     ref:'Category',
//     require:true
// }