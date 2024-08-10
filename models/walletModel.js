const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    money:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model("Wallet",walletSchema);