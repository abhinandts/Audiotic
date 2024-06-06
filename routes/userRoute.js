require('dotenv').config()

const express = require("express")

const userSession = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(userSession)
const mongoose = require("mongoose")

const userRoute = express()

mongoose
    .connect(process.env.mongoURI)
    .then((res) => {
        console.log("user MongoDB connected");
    })
    .catch((err) => console.error(err));

const userStore = new MongoDBSession({
    uri: process.env.mongoURI,
    collection: "userSessions",
})

userRoute.use(userSession({
    secret: 'mySessionSecretForUser',
    resave: false,
    saveUninitialized: false,
    store: userStore
}))

// Template engine setup
const ejsLayouts = require('express-ejs-layouts')
userRoute.set('views', './views/user')
userRoute.use(ejsLayouts)
userRoute.set('layout', '../user/layouts/fullWidth')

// Middleware for static assets
userRoute.use(express.static('public/user'))
userRoute.use('/admin', express.static('public/admin'));


userRoute.use('/css', express.static(__dirname + '/public/user/css'))
userRoute.use('/fonts', express.static(__dirname + '/public/user/fonts'))
userRoute.use('/imgs', express.static(__dirname + '/public/user/imgs'))
userRoute.use('/js', express.static(__dirname + '/public/user/js'))
userRoute.use('/sass', express.static(__dirname + '/public/user/sass'))

// Body parsing middleware
const bodyParser = require('body-parser')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({ extended: true }))

// Authentication middleware
const check = require('../middlewares/userAuth')

// ---- controllers ----
const userController = require('../controllers/userController')


// ---- routes ----
userRoute.get("/register",check.isLoggedOut,userController.loadRegister)
userRoute.post('/register', userController.insertUser)

userRoute.get('/verify_otp',check.isLoggedOut, userController.verifyOtp)
userRoute.post('/verify_otp', userController.compareOtp)

userRoute.get('/resendOtp', userController.resendOtp)

userRoute.get('/login',check.isLoggedOut, userController.loadLogin)
userRoute.post('/login', userController.verifyLogin)

userRoute.get('/logout',userController.logout)

userRoute.get('/home', check.isLoggedIn,check.checkUserBlocked,userController.loadHome)

userRoute.get('/productPage', check.isLoggedIn,check.checkUserBlocked,userController.loadProduct)

userRoute.get('/allProducts', check.isLoggedIn,check.checkUserBlocked,userController.allProducts)

userRoute.get('/product', check.isLoggedIn,check.checkUserBlocked,userController.productByCategory)


module.exports = userRoute