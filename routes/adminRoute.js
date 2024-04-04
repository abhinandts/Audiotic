const express = require('express')
const ejsLayouts = require('express-ejs-layouts')

const adminRoute = express()

adminRoute.use(ejsLayouts)
adminRoute.set('layout','../admin/layouts/fullwidth')

adminRoute.use(express.static('public/admin'))

adminRoute.use('/css', express.static(__dirname + '/public/admin/css'))
adminRoute.use('/fonts', express.static(__dirname + '/public/admin/fonts'))
adminRoute.use('/imgs', express.static(__dirname + '/public/admin/imgs'))
adminRoute.use('/js', express.static(__dirname + '/public/admin/js'))
adminRoute.use('/sass', express.static(__dirname + '/public/admin/sass'))

adminRoute.set('views', './views/admin')

const bodyParser = require('body-parser')
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))

const adminController = require('../controllers/adminController')


adminRoute.get("/login", adminController.loadLogin)
adminRoute.post("/login", adminController.verifyLogin)

adminRoute.get("/dashboard", adminController.loadDashboard)

adminRoute.get("/users",adminController.loadUsers)

adminRoute.get("*", (req, res) => {
    res.redirect('/admin')
})

module.exports = adminRoute