require('dotenv').config()
const mongoose = require("mongoose")
const express = require("express")
const app = express()



// ---- for users ----
const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

// ---- for admin ----
const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)

app.set('view engine', 'ejs')


app.listen(process.env.PORT, function () {
    console.log(`http://localhost:${process.env.PORT}/`)
})