const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Banner = require('../models/bannerModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Wallet = require('../models/walletModel')
const Products = require('../models/productModel')

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const otpService = require('../utils/otp')
const wishlistModel = require('../models/wishlistModel')

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
            await user.save();

            let wallet = new Wallet({
                user: user._id
            })
            await wallet.save();

            req.session.Data = null;

            res.json({ success: true, redirectUrl: '/login' })
        } else {
            res.json({ success: false, message: 'Invalid OTP' })
        }
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Server error" })
    }
}

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
            res.json({ success: true, message: 'Mail Resended' })
        } else {
            res.json({ success: false, message: 'Mail not sent' })
        }
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Server error" })
    }
}

// --- forgotPassword ----
const loadForgotPassword = async (req, res) => {
    try {
        res.render('forgotPassword', { breadcrumb: "Forgot Password", header: false, smallHeader: true, footer: false })
    } catch (error) {
        console.log(error.message)
    }
}
const checkEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email })
        if (!user) {
            res.json({ success: false, message: "No User found with this Email. Please register" })
        } else {
            req.session.user = user
            const otp = otpService.generateOtp()
            req.session.otp = otp
            if (user) {
                sendVerifyMailRes = otpService.sendVerifyMail(user.name, user.email, otp)
                if (sendVerifyMailRes) {
                    console.log("email sent")
                }
                else {
                    console.log("email not sent");
                }
            }
            res.json({ success: true, redirectUrl: '/changePassword' })
        }
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Server error" })
    }
}

// ---- /changePassword ----
const loadChangePassword = async (req, res) => {
    try {
        res.render('changePassword', { breadcrumb: "Change Password", header: false, smallHeader: true, footer: false })
    } catch (error) {
        console.log(error.message)
    }
}
const changePassword = async (req, res) => {
    try {
        const otp = req.body.otp
        const password = req.body.password
        const hashedPswd = await bcrypt.hash(password, 12)
        const sessionOtp = req.session.otp

        if (otp == sessionOtp) {

            const id = req.session.user._id
            console.log(id)
            const user = await User.findByIdAndUpdate(id, { $set: { hashedPswd: hashedPswd } })
            if (user) {
                console.log("password changed")
                req.session.destroy((err) => {
                    if (err) {
                        console.log("error destroying ", err);
                        return res.status(500).json({ success: false, message: 'Error destrying session' })
                    }
                    return res.json({ success: true, redirectUrl: '/login' })
                })
            } else {
                return res.json({ success: false, message: 'password not changed' })
            }
        } else {
            return res.json({ success: false, message: "OTP not matching" })
        }
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
        const products = await Product.find({ is_active: true, stock: { $gt: 0 } }).populate('category', 'name')
        const banners = await Banner.find()

        res.render('home', { title: "Home", products, banners, breadcrumb: "AUDIOTIC Home Page", header: true, smallHeader: false, footer: true })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /productPage ----------------

const loadProduct = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send("Invalid product ID");
        }
        const product = await Product.findById(req.query.productId).populate('category', 'name')
        const relatedProducts = await Product.find({ category: product.category._id, _id: { $ne: product._id } })

        res.render('productPage', { product, relatedProducts, breadcrumb: product.productName, header: true, smallHeader: false, footer: true })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /products ---------------

const loadProducts = async (req, res) => {
    try {
        let breadcrumb, products;
        const categoryId = req.query.categoryId

        if (categoryId) {
            products = await Product.find({ category: categoryId, is_active: true })
            breadcrumb = await Category.find({ name: 1 })
        } else {
            products = await Product.find().populate('category', 'name')
            breadcrumb = "All Products"
        }

        const categories = await Category.find({ is_active: true }, { name: 1 })

        res.render('products', { products, categories, breadcrumb, header: true, smallHeader: false, footer: true })

    } catch (error) {
        console.log(error.message)
    }
}
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ is_active: true }, { name: 1 })

        if (categories && categories.length > 0) {
            res.status(200).send(categories)
        } else {
            res.status(404).send('No categories found')
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server Error')
    }
}
const productsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId
        const products = await Products.find({ category: categoryId }, { productSpecifications: 0 }).populate('category')
        if (products.length === 0) {
            res.status(404).send("No related Products found")
        } else {
            res.status(200).send(products)
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server Error')
    }
}

const searchProducts = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        console.log(searchTerm)

        const products = await Product.find({
            productName: { $regex: searchTerm, $options: 'i' },  // Case-insensitive search
            is_active: true  // Ensure only active products are returned
        }).populate('category');

        res.json(products);
    } catch (error) {
        console.error(error)
        res.status(500).json({message:'Internal Server Error'})
    }
}


// ---------------------------------------------------------

const loadProfile = async (req, res) => {
    try {
        const userId = req.session.userId
        const user = await User.findById(userId)
        const wallet = await Wallet.findOne({ user: userId })

        res.render('myAccount', { user, wallet, header: false, smallHeader: true, breadcrumb: "My Account", footer: true })
    } catch (error) {
        console.log(error.message)
    }
}

const updateAccountDetails = async (req, res) => {
    try {
        const { name, mobile } = req.body;
        const userId = req.session.userId;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { name: name, mobile: mobile } },
            { new: true, useFindAndModify: false }
        );

        if (!user) {
            return res.status(404).send('User not found.')
        }

        // Send success response
        res.status(200).send('User data updated successfully.');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user.');
    }
};

const checkNameExists = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.session.userId

        const user = await User.findOne({
            name: { $regex: new RegExp('^' + name + '$', 'i') },
            _id: { $ne: userId } // Exclude the current user
        });

        if (user) {
            return res.status(200).json({ exists: true })
        } else {
            return res.status(200).json({ exists: false })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Server error' });
    }
};


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
    logout,
    loadProducts,
    loadProfile,
    updateAccountDetails,
    checkNameExists,
    loadForgotPassword,
    checkEmail,
    loadChangePassword,
    changePassword,
    getCategories,
    productsByCategory,
    searchProducts
}