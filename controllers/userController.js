const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const otpService = require('../utils/otp')

// ---- /register ----------------

const loadRegister = async (req, res) => {
    try {
        console.log(req.session)
        let message = req.session.errorMessage
        delete req.session.errorMessage
        res.render('registration', { message, breadcrumb: 'Register', header: false, footer: false, smallHeader: true })
    }
    catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {
    try {
        let sendVerifyMailRes

        const otp = otpService.generateOtp()
        console.log(`Otp generated from ${otp}`)
        const { name, email, mobile, password } = req.body
        let existingEmail = await User.findOne({ email })
        if (existingEmail) {
            req.session.errorMessage = 'You are already registered user.'
            return res.redirect('/register')
        }
        let existingUserName = await User.findOne({ name })
        if (existingUserName) {
            req.session.errorMessage = 'This username is taken'
            return res.redirect('/register')
        }
        const hashedPswd = await bcrypt.hash(password, 12)
        const data = {
            name, email, mobile, hashedPswd, otp
        }
        req.session.Data = data

        if (data) {
            sendVerifyMailRes = otpService.sendVerifyMail(req.session.Data.name, req.session.Data.email, req.session.Data.otp)
            if (sendVerifyMailRes) {
                console.log("email sent")
            }
            else {
                console.log("email not sent");
            }
        }
        if (sendVerifyMailRes) {
            res.redirect('/verify_otp')
        } else {
            res.render('register', { breadcrumb: 'Verify OTP', header: false, smallHeader: true, footer: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /verify_otp ----

const verifyOtp = async (req, res) => {
    try {
        res.render('otp_page', { message: false, breadcrumb: 'OTP Page', header: false, smallHeader: true, footer: false })
    } catch (error) {
        console.log(error.message)
    }
}

const compareOtp = async (req, res) => {
    try {
        const otpValue = req.body.otp
        const sessionOtp = req.session.Data.otp
        if (sessionOtp == otpValue) {
            const userData = await req.session.Data
            const user = new User(userData)
            await user.save()
            res.redirect('/home')
        } else {
            res.render('otp_page', { message: true, breadcrumb: 'OTP Page', header: false, smallHeader: true, footer: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /resend OTP ---------

const resendOtp = async (req, res) => {
    try {
        const newOtp = otpService.generateOtp()
        const data = req.session.Data
        data.otp = newOtp

        if (data) {
            sendVerifyMailRes = otpService.sendVerifyMail(req.session.Data.name, req.session.Data.email, req.session.Data.otp)
            if (sendVerifyMailRes) {
                console.log("email sent")
            }
            else {
                console.log("email not sent");
            }
        }
        res.render('otp_page', { message: true, breadcrumb: 'OTP Page', header: false, smallHeader: true, footer: false })
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /login -------------------------

const loadLogin = async (req, res) => {
    try {
        if (req.session.userId) {
            res.redirect('/home')
        } else {
            res.render('login', { breadcrumb: "Log in", header: false, smallHeader: true, footer: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        const userData = await User.findOne({ email: email })

        if (!userData) {
            console.log("no user found")
            res.render('login', { message: 'No users found with the email. please re-enter email', breadcrumb: "Log in", header: false, smallHeader: true, footer: false })
        }
        else if (userData.is_active === false) {
            res.render('login', { breadcrumb: "Log in", header: false, smallHeader: true, footer: false, message: 'You are blocked. please contact our customer service.', })
        }
        else {
            const isMatch = await bcrypt.compare(password, userData.hashedPswd)

            if (isMatch) {
                const products = await Product.find({ is_active: true }).populate('category', 'name')
                req.session.userId = userData.id
                console.log(req.session)
                res.redirect('/home')
                // res.render('home', { title: "Home", products, breadcrumb: "AUDIOTIC Home Page", header: true, smallHeader: false, footer: true })
            } else {
                res.render('login', { message: 'Password is not matching', breadcrumb: "Log in", header: false, smallHeader: true, footer: false })
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /logout --------------

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) throw err
            res.redirect('/login')
        })
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /home -----------------------

const loadHome = async (req, res) => {
    try {
        const products = await Product.find({ is_active: true }).populate('category', 'name')

        res.render('home', { title: "Home", products, breadcrumb: "AUDIOTIC Home Page", header: true, smallHeader: false, footer: true })
    } catch (error) {
        console.log(error.message)
    }
}


// ---- /productPage ----------------

const loadProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.query.productId).populate('category', 'name')

        const relatedProducts = await Product.find({ category: product.category._id, _id: { $ne: product._id } })

        res.render('productPage', { product, relatedProducts, breadcrumb: product.productName, header: true, smallHeader: false, footer: true })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /allProducts -------------

const allProducts = async (req, res) => {
    try {
        const products = await Product.find({ is_active: true }).populate('category', 'name')
        const categories = await Category.find({}, { name: 1 })
        res.render('allProducts', { products, categories, breadcrumb: "All Products", header: true, smallHeader: false, footer: true })
    } catch (error) {
        console.log(error)
    }
}

// ---- /product ---------------

const productByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.query.categoryId, is_active: true })
        const categories = await Category.find({}, { name: 1 })

        res.render('productsByCategory', { products, categories, breadcrumb: "All Products", header: true, smallHeader: false, footer: true })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyOtp,
    compareOtp,
    loadLogin,
    verifyLogin,
    loadHome,
    loadProduct,
    resendOtp,
    allProducts,
    productByCategory,
    logout
}