require('dotenv').config()

const express = require('express')
const adminSession = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(adminSession)
const mongoose = require("mongoose")


const Toastify = require('toastify-js'); // Import Toastify

// // Import CSS (optional, for styling)
// import "toastify-js/src/toastify.css";

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
adminRoute.set('layout', '../admin/layouts/fullwidth')

// Middleware for static assets
adminRoute.use(express.static('public'))

adminRoute.use('/css', express.static(__dirname + '/public/admin/css'))
adminRoute.use('/fonts', express.static(__dirname + '/public/admin/fonts'))
adminRoute.use('/imgs', express.static(__dirname + '/public/admin/imgs'))
adminRoute.use('/js', express.static(__dirname + '/public/admin/js'))
adminRoute.use('/sass', express.static(__dirname + '/public/admin/sass'))

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


// // Multer setup for file uploads
// const productStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/admin/productImages')),
//   filename: (req, file, cb) => cb(null, file.originalname)
// });
// const uploadProduct = multer({ storage: productStorage });

// const bannerStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/admin/bannerImages')),
//   filename: (req, file, cb) => cb(null, file.originalname)
// });
// const uploadBanner = multer({ storage: bannerStorage });

//----------------------


// ---- controllers ----------------------
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const bannerController = require('../controllers/bannerController')
// ---------------------------------------


adminRoute.get("/login", adminController.loadLogin)
adminRoute.post("/login", adminController.verifyLogin)

adminRoute.get("/logout", auth.isLogin, adminController.logOut)

adminRoute.get("/dashboard", auth.isLogin, adminController.loadDashboard)

adminRoute.get("/users", auth.isLogin, adminController.loadUsers)

adminRoute.get("/blockUser/:userId", auth.isLogin, adminController.blockUser)

// ---- category ----

adminRoute.get("/category", auth.isLogin, categoryController.loadCategory)

adminRoute.post("/addCategory", categoryController.addCategory)

adminRoute.get("/disable/:categoryId", categoryController.disableCategory)

adminRoute.get("/editCategory/:categoryId", categoryController.editCategory)
adminRoute.post("/editCategory", categoryController.saveCategory)

// ---- product ----

adminRoute.get("/products", auth.isLogin, productController.loadProducts)

adminRoute.get("/newProduct", auth.isLogin, productController.newProduct)
adminRoute.post("/newProduct", upload.array('image', 5), productController.addProduct)

adminRoute.get("/blockProduct/:productId", productController.blockProduct)

adminRoute.get("/editProduct/:productId", auth.isLogin, productController.editProduct)
adminRoute.post("/editProduct/:productId", productController.updateProduct)

adminRoute.get("/editProduct/deleteImage/:imageName/:productId", auth.isLogin, productController.deleteImage)

// adminRoute.get("/replaceImage/:imageId",auth.isLogin,productController.replaceImage)

// ---- orders ----

// adminRoute.get("/orders",auth.isLogin,orderController.loadOrders)

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