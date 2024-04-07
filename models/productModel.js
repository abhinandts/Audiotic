const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    specification:{
        type:String,
        require:true
    },
    mrp:{
        type:Number,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    stock:{
        type:Number,
        require:true
    },
    image:{
        type:Array,
        require:true
    },category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        require:true
    },
    is_active :{
        type:Boolean,
        default:true
    }
})
module.exports = mongoose.model('Product',productSchema)