const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/audiotic")

const express = require("express")
const app = express()

//for users
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
app.set('view engine','ejs')

app.listen(4000,function (){
    console.log("server is running")
})