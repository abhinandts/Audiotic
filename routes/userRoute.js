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
userRoute.use('/scripts', express.static(__dirname + '/public/user/scripts'))

// Body parsing middleware
const bodyParser = require('body-parser')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({ extended: true }))

// Authentication middleware
const check = require('../middlewares/userAuth')

// ---- controllers ----
const userController = require('../controllers/userController')
const addressController = require('../controllers/addressController')
const cartController = require('../controllers/cartController')
const wishlistController = require('../controllers/wishlistController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const checkoutController = require('../controllers/checkoutController')


// ---- routes ----

userRoute.get("/register", check.isLoggedOut, userController.loadRegister)
userRoute.post('/register', userController.insertUser)

userRoute.get('/verify_otp', check.isLoggedOut, userController.verifyOtp)
userRoute.post('/verifyOtp', userController.compareOtp)
userRoute.get('/api/resendOtp', userController.resendOtp)


userRoute.get('/forgotPassword', check.isLoggedOut, userController.loadForgotPassword)
userRoute.post('/api/checkUser', userController.checkEmail)

userRoute.get('/changePassword', check.isLoggedOut, userController.loadChangePassword)
userRoute.post('/api/changePassword', check.isLoggedOut, userController.changePassword)


userRoute.get('/login', check.isLoggedOut, userController.loadLogin)
userRoute.post('/login', userController.verifyLogin)

userRoute.get('/logout', check.isLoggedIn, userController.logout)

userRoute.get('/home', check.isLoggedIn, check.checkUserBlocked, userController.loadHome)

userRoute.get('/productPage', check.isLoggedIn, check.checkUserBlocked, userController.loadProduct)

userRoute.get('/products', check.isLoggedIn, check.checkUserBlocked, userController.loadProducts)

userRoute.get('/myAccount', check.isLoggedIn, check.checkUserBlocked, userController.loadProfile)
userRoute.post('/api/myAccount/updateAccountDetails', check.isLoggedIn, check.checkUserBlocked, userController.updateAccountDetails)
userRoute.post('/api/myAccount/checkName', check.isLoggedIn, check.checkUserBlocked, userController.checkNameExists)
userRoute.get('/api/myAccount/getAddresses', check.isLoggedIn, check.checkUserBlocked, addressController.getAddresses)
userRoute.post('/api/myAccount/addAddress', check.isLoggedIn, check.checkUserBlocked, addressController.addAddress)
userRoute.delete('/api/myAccount/deleteAddress/:addressId', check.isLoggedIn, check.checkUserBlocked, addressController.deleteAddress)
userRoute.get('/api/myAccount/editAddress/:addressId', check.isLoggedIn, check.checkUserBlocked, addressController.getEditAddress)
userRoute.put('/api/myAccount/editAddress', check.isLoggedIn, check.checkUserBlocked, addressController.editAddress)
userRoute.get('/api/myAccount/getOrders',orderController.getOrders)
userRoute.post('/myAccount/trackOrder',orderController.trackOrder)

userRoute.get('/cart', check.isLoggedIn, check.checkUserBlocked, cartController.loadCart)
userRoute.post('/api/addToCart', check.isLoggedIn, check.checkUserBlocked, cartController.addToCart)
userRoute.get('/api/cart/getProducts',check.isLoggedIn, check.checkUserBlocked, cartController.getProducts)
userRoute.post('/api/cart/updateQuantity',check.isLoggedIn, check.checkUserBlocked, cartController.updateQuantity)
userRoute.post('/api/cart/removeProduct', check.isLoggedIn, check.checkUserBlocked, cartController.removeFromCart)
userRoute.get('/api/cart/getCount',cartController.getCount)

userRoute.get('/checkout',check.isLoggedIn,check.checkUserBlocked,checkoutController.loadCheckout)
userRoute.post('/api/checkout/placeOrder',check.isLoggedIn,check.checkUserBlocked,checkoutController.placeOrder)
userRoute.post('/api/checkout/verifyPayment',check.isLoggedIn,check.checkUserBlocked,checkoutController.verifyPayment)

userRoute.get('/orders/orderConfirmation/:orderId',orderController.orderConfirmation)
userRoute.post('/api/order/cancelOrder',orderController.cancelOrder)

userRoute.get('/api/coupons/getCoupons',couponController.getCoupons)

userRoute.get('/wishlist',wishlistController.loadWishlist)
userRoute.post('/api/wishlist/addProduct',wishlistController.addProduct)
userRoute.get('/api/wishlist/getProducts',wishlistController.getProducts)
userRoute.post('/api/wishlist/removeProduct',wishlistController.removeProduct)
userRoute.get('/api/wishlist/getCount',wishlistController.getCount)

module.exports = userRoute