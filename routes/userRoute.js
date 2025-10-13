const express = require("express")

const userRoute = express.Router()

// Authentication middleware
const check = require('../middlewares/userAuth')

// Controllers
const userController = require('../controllers/userController')
const addressController = require('../controllers/addressController')
const cartController = require('../controllers/cartController')
const wishlistController = require('../controllers/wishlistController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const checkoutController = require('../controllers/checkoutController')
const walletController = require('../controllers/walletController')

// Auth routes
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

// Home and product routes
userRoute.get('/home', check.isLoggedIn, check.checkUserBlocked, userController.loadHome)

userRoute.get('/products', check.isLoggedIn, check.checkUserBlocked, userController.loadProducts)
userRoute.get('/api/products', check.isLoggedIn, check.checkUserBlocked, userController.fetchProducts)
userRoute.get('/api/products/search', userController.searchProducts)

userRoute.get('/productPage', check.isLoggedIn, check.checkUserBlocked, userController.loadProduct)

// Account routes
userRoute.get('/myAccount', check.isLoggedIn, check.checkUserBlocked, userController.loadProfile)
userRoute.post('/api/myAccount/updateAccountDetails', check.isLoggedIn, check.checkUserBlocked, userController.updateAccountDetails)
userRoute.post('/api/myAccount/checkName', check.isLoggedIn, check.checkUserBlocked, userController.checkNameExists)

// Address routes
userRoute.get('/api/myAccount/getAddresses', check.isLoggedIn, check.checkUserBlocked, addressController.getAddresses)
userRoute.post('/api/myAccount/addAddress', check.isLoggedIn, check.checkUserBlocked, addressController.addAddress)
userRoute.delete('/api/myAccount/deleteAddress/:addressId', check.isLoggedIn, check.checkUserBlocked, addressController.deleteAddress)
userRoute.get('/api/myAccount/editAddress/:addressId', check.isLoggedIn, check.checkUserBlocked, addressController.getEditAddress)
userRoute.put('/api/myAccount/editAddress', check.isLoggedIn, check.checkUserBlocked, addressController.editAddress)

// Order routes
userRoute.get('/api/myAccount/getOrders', orderController.getOrders)
userRoute.get('/myAccount/getOrder/:orderId', orderController.getOrder)
userRoute.post('/myAccount/trackOrder', orderController.trackOrder)
userRoute.get('/orders/orderConfirmation/:orderId', orderController.orderConfirmation)
userRoute.post('/api/order/cancelOrder', orderController.cancelOrder)
userRoute.post('/api/order/returnOrder', orderController.returnOrder)

// Wallet routes
userRoute.post('/api/myAccount/walletRecharge', walletController.rechargeWallet)
userRoute.post('/api/myAccount/wallet/verifyPayment', walletController.verifyPayment)

// Cart routes
userRoute.get('/cart', check.isLoggedIn, check.checkUserBlocked, cartController.loadCart)
userRoute.post('/api/cart/addToCart', check.isLoggedIn, check.checkUserBlocked, cartController.addToCart)
userRoute.get('/api/cart/getProducts', check.isLoggedIn, check.checkUserBlocked, cartController.getProducts)
userRoute.post('/api/cart/updateQuantity', check.isLoggedIn, check.checkUserBlocked, cartController.updateQuantity)
userRoute.post('/api/cart/removeProduct', check.isLoggedIn, check.checkUserBlocked, cartController.removeFromCart)
userRoute.get('/api/cart/getCount', cartController.getCount)

// Checkout routes
userRoute.get('/checkout', check.isLoggedIn, check.checkUserBlocked, checkoutController.loadCheckout)
userRoute.post('/api/checkout/placeOrder', check.isLoggedIn, check.checkUserBlocked, checkoutController.placeOrder)
userRoute.post('/api/checkout/verifyPayment', check.isLoggedIn, check.checkUserBlocked, checkoutController.verifyPayment)
userRoute.post('/api/checkout/handleFailedPayment', checkoutController.failedPayment)
userRoute.get('/api/retryPayment', checkoutController.retryPayment)

// Coupon routes
userRoute.get('/api/coupons/getCoupons', couponController.getCoupons)

// Wishlist routes
userRoute.get('/wishlist', wishlistController.loadWishlist)
userRoute.post('/api/wishlist/addProduct', wishlistController.addProduct)
userRoute.get('/api/wishlist/getProducts', wishlistController.getProducts)
userRoute.post('/api/wishlist/removeProduct', wishlistController.removeProduct)
userRoute.get('/api/wishlist/getCount', wishlistController.getCount)
userRoute.post('/api/wishlist/isProductInWishlist', wishlistController.findProduct)

module.exports = userRoute