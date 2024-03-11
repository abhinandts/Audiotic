
const express = require("express")
const ejsLayouts = require('express-ejs-layouts')

const user_route = express()

user_route.use(ejsLayouts)
user_route.set('layout','./layouts/fullWidth')

user_route.use(express.static('public'))
user_route.use('/css',express.static(__dirname+'public/css'))
user_route.use('/fonts',express.static(__dirname+'public/fonts'))
user_route.use('/imgs',express.static(__dirname+'public/imgs'))
user_route.use('/js',express.static(__dirname+'public/js'))
user_route.use('/sass',express.static(__dirname+'public/sass'))

user_route.set('views','./views/users')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))



const userController = require('../controllers/userController')

user_route.get("/register",userController.loadRegister)

user_route.post('/register',userController.insertUser)

module.exports= user_route