const express = require('express')
const multer = require('multer')
const path = require('path')

const adminRoute = express.Router()

// Authentication middleware
const auth = require('../middlewares/adminAuth')

// Multer configuration for product images
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

// Multer configuration for banner images
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

// Controllers
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const bannerController = require('../controllers/bannerController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
const dashboardController = require('../controllers/dashboardController')

// Auth routes
adminRoute.get("/login", adminController.loadLogin)
adminRoute.post("/login", adminController.verifyLogin)
adminRoute.get("/logout", auth.isLogin, adminController.logOut)

// User management
adminRoute.get("/users", auth.isLogin, adminController.loadUsers)
adminRoute.get("/blockUser/:userId", auth.isLogin, adminController.blockUser)

// Dashboard routes
adminRoute.get("/dashboard", auth.isLogin, dashboardController.loadDashboard)
adminRoute.get('/api/dashboard/getChartData', orderController.getChartData)
adminRoute.get('/api/dashboard/value', orderController.filter)
adminRoute.post('/api/dashboard/filterByDate', orderController.filterBydDate)

// Category routes
adminRoute.get("/category", auth.isLogin, categoryController.loadCategory)
adminRoute.post("/addCategory", auth.isLogin, categoryController.addCategory)
adminRoute.post('/api/category/checkName', categoryController.checkName)
adminRoute.get("/disable/:categoryId", categoryController.disableCategory)
adminRoute.get("/editCategory/:categoryId", categoryController.loadEditCategory)
adminRoute.post("/editCategory", categoryController.updateCategory)

// Product routes
adminRoute.get("/products", auth.isLogin, productController.loadProducts)
adminRoute.get("/newProduct", auth.isLogin, productController.newProduct)
adminRoute.post("/newProduct", upload.array('image', 5), productController.addProduct)
adminRoute.post("/api/product/checkName", productController.checkProductName)
adminRoute.get("/blockProduct/:productId", productController.blockProduct)
adminRoute.get("/editProduct/:productId", auth.isLogin, productController.editProduct)
adminRoute.post("/editProduct/:productId", auth.isLogin, upload.array('image', 5), productController.updateProduct)

// Order routes
adminRoute.get("/orders", auth.isLogin, orderController.loadOrderPage)
adminRoute.get('/showOrder/:orderId', orderController.showOrder)
adminRoute.post('/api/orders/updateOrderStatus', orderController.updateStatus)
adminRoute.get('/api/orders/loadOrders', orderController.loadOrders)

// Coupon routes
adminRoute.get("/coupons", couponController.loadCouponPage)
adminRoute.post("/api/coupons/createCoupon", couponController.createCoupon)
adminRoute.get("/api/coupons/fetchCoupons", couponController.loadCoupons)
adminRoute.put("/api/coupons/disableCoupon", couponController.disableCoupon)
adminRoute.get("/coupons/editCoupon/:couponId", couponController.loadEditCoupon)
adminRoute.post("/coupons/editCoupon", couponController.updateCoupon)
adminRoute.get('/api/coupons/checkName', couponController.checkName)
adminRoute.post("/api/coupons/create", couponController.createCoupon)
adminRoute.put("/api/coupons/toggle/:id", couponController.toggleCouponStatus)

// Offer routes
adminRoute.get("/offers", offerController.loadOffers)
adminRoute.post("/api/offers/productOffer", offerController.applyProductOffer)
adminRoute.post("/api/offers/categoryOffer", offerController.applyCategoryOffer)

// Banner routes
adminRoute.get("/banners", auth.isLogin, bannerController.loadBanners)
adminRoute.get("/newBanner", auth.isLogin, bannerController.newBanner)
adminRoute.post("/newBanner", auth.isLogin, uploadBanner.array('image', 1), bannerController.addBanner)
adminRoute.get("/deleteBanner/:bannerId", bannerController.deleteBanner)

module.exports = adminRoute