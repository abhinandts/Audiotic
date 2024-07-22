const mongoose = require("mongoose")

const bannerSchema = new mongoose.Schema({
    heading4: {
        type: String,
        required: true
    },
    heading2: {
        type: String,
        require: true
    },
    heading1: {
        type: String,
        require: true
    },
    paragraph: {
        type: String,
        require: true
    },
    route: {
        type: String,
        require: true
    },
    image: {
        type: Array,
        require: true
    },
})

module.exports = mongoose.model('Banner', bannerSchema)