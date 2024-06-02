const mongoose = require("mongoose")
require('dotenv').config()

mongoose.connect("mongodb://127.0.0.1:27017/Audiotic")


const express = require("express")
const app = express()
const session = require('express-session')

//for users
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)


//---- for admin
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)


app.set('view engine','ejs') 


app.use(session({
    secret:'mySessionSecret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:3600000
    }
}))



app.listen(process.env.PORT,function (){
    console.log(`http://localhost:4000/`)
})