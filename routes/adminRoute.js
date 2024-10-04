require('dotenv').config()

const express = require('express')
const adminSession = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(adminSession)
const mongoose = require("mongoose")

const fs = require('fs');

const Toastify = require('toastify-js'); // Import Toastify

const adminRoute = express()

// Database connection
mongoose
  .connect(process.env.mongoURI)
  .then((res) => console.log("admin mongodb connected"))
  .catch((err) => console.error(err));

// Session store setup
const adminStore = new MongoDBStore({
  uri: process.env.mongoURI,
  collection: "adminSessions",
})

// Middleware setup
adminRoute.use(express.json());
adminRoute.use(require('express-session')({
  secret: 'mySessionSecretForAdmin',
  store: adminStore,
  resave: false,
  saveUninitialized: false,
}))


// Template engine setup
const ejsLayouts = require('express-ejs-layouts')
adminRoute.set('views', './views/admin')
adminRoute.use(ejsLayouts)
adminRoute.set('layout', '../admin/layouts/fullWidth')

adminRoute.use(express.json());

// Middleware for static assets
adminRoute.use(express.static('public'))

adminRoute.use('/css', express.static(__dirname + '/public/admin/css'))
adminRoute.use('/fonts', express.static(__dirname + '/public/admin/fonts'))
adminRoute.use('/imgs', express.static(__dirname + '/public/admin/imgs'))
adminRoute.use('/js', express.static(__dirname + '/public/admin/js'))
adminRoute.use('/sass', express.static(__dirname + '/public/admin/sass'))
adminRoute.use('/scripts', express.static(__dirname + '/public/admin/scripts'))

// Body parsing middleware
const bodyParser = require('body-parser')
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))

// Authentication middleware
const auth = require('../middlewares/adminAuth')


// ------------------
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, path.join(__dirname, '../public/admin/productImages'))
  },

  filename: function (req, file, cb) {

    const name = file.originalname
    cb(null, name)
  }
})

const upload = multer({ storage: storage })

// ---- banner
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/admin/bannerImages'))
  },
  filename: function (req, file, cb) {
    const name = file.originalname
    cb(null, name)
  }
})

const uploadBanner = multer({ storage: bannerStorage })


// ---- controllers ----------------------
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const bannerController = require('../controllers/bannerController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
const dashboardController = require('../controllers/dashboardController')
// ---------------------------------------


adminRoute.get("/login", adminController.loadLogin)
adminRoute.post("/login", adminController.verifyLogin)

adminRoute.get("/logout", auth.isLogin, adminController.logOut)

adminRoute.get("/users", auth.isLogin, adminController.loadUsers)

adminRoute.get("/blockUser/:userId", auth.isLogin, adminController.blockUser)

// ---- dashboard ----

adminRoute.get("/dashboard", auth.isLogin, dashboardController.loadDashboard)


// ---- category ----

adminRoute.get("/category", auth.isLogin, categoryController.loadCategory)
adminRoute.post("/addCategory", categoryController.addCategory)
adminRoute.post('/api/category/checkName',categoryController.checkName)

adminRoute.get("/disable/:categoryId", categoryController.disableCategory)

adminRoute.get("/editCategory/:categoryId", categoryController.loadEditCategory)
adminRoute.post("/editCategory", categoryController.updateCategory)

// ---- product ----

adminRoute.get("/products", auth.isLogin, productController.loadProducts)

adminRoute.get("/newProduct", auth.isLogin, productController.newProduct)
adminRoute.post("/newProduct", upload.array('image', 5), productController.addProduct)
adminRoute.get("/api/product/checkName", productController.checkProductName)

adminRoute.get("/blockProduct/:productId", productController.blockProduct)

adminRoute.get("/editProduct/:productId", auth.isLogin, productController.editProduct)
adminRoute.post("/editProduct/:productId", auth.isLogin, upload.array('image', 5), productController.updateProduct)

// ---- orders ----

adminRoute.get("/orders", auth.isLogin, orderController.loadOrderPage)
adminRoute.get('/showOrder/:orderId', orderController.showOrder)
adminRoute.post('/api/orders/updateOrderStatus', orderController.updateStatus)
adminRoute.get('/api/orders/loadOrders', orderController.loadOrders)

// ---- sales ----

adminRoute.get('/sales', auth.isLogin, orderController.salesPage)
adminRoute.get('/api/sales/getSalesOrders', orderController.loadSalesOrders)
adminRoute.get('/api/sales/value', orderController.filter)

adminRoute.get('/api/dashboard/getChartData', orderController.getChartData)

// ---- coupons ----

adminRoute.get("/coupons", couponController.loadCouponPage)
adminRoute.post("/api/coupons/createCoupon", couponController.createCoupon)
adminRoute.get("/api/coupons/fetchCoupons", couponController.loadCoupons)
adminRoute.put("/api/coupons/disableCoupon", couponController.disableCoupon)
adminRoute.get("/coupons/editCoupon/:couponId", couponController.loadEditCoupon)
adminRoute.post("/coupons/editCoupon", couponController.updateCoupon)
adminRoute.get('/api/coupons/checkName', couponController.checkName)

adminRoute.post("/api/coupons/create", couponController.createCoupon);
adminRoute.put("/api/coupons/toggle/:id", couponController.toggleCouponStatus);

// ---- offers ----

adminRoute.get("/offers", offerController.loadOffers)
adminRoute.post("/api/offers/productOffer", offerController.applyProductOffer)
adminRoute.post("/api/offers/categoryOffer", offerController.applyCategoryOffer)

// ---- banners ----

adminRoute.get("/banners", auth.isLogin, bannerController.loadBanners)

adminRoute.get("/newBanner", auth.isLogin, bannerController.newBanner)
adminRoute.post("/newBanner", auth.isLogin, uploadBanner.array('image', 1), bannerController.addBanner)

adminRoute.get("/deleteBanner/:bannerId", bannerController.deleteBanner)

// Catch-all route for unmatched routes
adminRoute.get("*", (req, res) => {
  res.status(404).send("Route not found");
})

module.exports = adminRoute