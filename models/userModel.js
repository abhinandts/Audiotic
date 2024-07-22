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
        sparse:true
    },
    mobile:{
        type:String,
        sparse: true
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
    },
    is_active:{
        type:Boolean,
        default:true
    },
    googleId: {
        type: String,
        unique: true, // Ensure googleId is unique
        sparse: true // Allows the field to be optional
    }
})

module.exports = mongoose.model('User',userSchema)