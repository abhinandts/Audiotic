const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    hashedPswd:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    is_active:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('User',userSchema)