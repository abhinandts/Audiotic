const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/audiotic")

const express = require("express")
const app = express()
const session = require('express-session')




//for users
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
app.set('view engine','ejs')


app.use(session({
    secret:'mySessionSecret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:3600000
    }
}))





app.listen(4000,function (){
    console.log(`http://localhost:4000/`)
})


