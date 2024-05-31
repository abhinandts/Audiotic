const express = require("express")
const ejsLayouts = require('express-ejs-layouts')
const session = require('express-session')

const config = require('../config/config')

const user_route = express()

user_route.use(ejsLayouts)
user_route.set('layout', '../user/layouts/fullWidth')

user_route.use(express.static('public/user'))

user_route.use('/admin', express.static('public/admin'));

user_route.use('/css', express.static(__dirname + '/public/user/css'))
user_route.use('/fonts', express.static(__dirname + '/public/user/fonts'))
user_route.use('/imgs', express.static(__dirname + '/public/user/imgs'))
user_route.use('/js', express.static(__dirname + '/public/user/js'))
user_route.use('/sass', express.static(__dirname + '/public/user/sass'))

user_route.set('views', './views/user')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true })) 

const userController = require('../controllers/userController')

//session
user_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}))

user_route.get("/register", userController.loadRegister)
user_route.post('/register', userController.insertUser)

user_route.get('/verify_otp', userController.verifyOtp)
user_route.post('/verify_otp', userController.compareOtp)

user_route.get('/resendOtp',userController.resendOtp)

user_route.get('/login',userController.loadLogin)
user_route.post('/login',userController.verifyLogin)

user_route.get('/home',userController.loadHome)

user_route.get('/productPage',userController.loadProduct)

user_route.get('/allProducts',userController.allProducts)

user_route.get('/product',userController.productByCategory)





module.exports = user_route


// user_route.use('/images',express.static(__dirname+'/public/productImages'))
