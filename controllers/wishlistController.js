const User = require('../models/userModel')
const Product = require('../models/productModel')
const Wishlist = require('../models/wishlistModel')

const loadWishlist = async (req, res) => {
    try {

        res.render('wishlist', { header: true, smallHeader: false, breadcrumb: "Wishlist", footer: true })

    } catch (error) {
        console.error(error)
    }
}

const addProduct = async (req, res) => {
    try {
        const productId = req.body.productId
        const userId = req.session.userId

        const user = User.findById(userId)
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }
        const product = Product.findById(productId)
        if (!product) {
            return res.status(400).json({ error: "Product not found" })
        }

        let wishlist = await Wishlist.findOne({ user: userId })

        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                products: [
                    {
                        product: productId
                    }
                ]
            })
        } else {
            if (wishlist.products.some(item => item.product.equals(productId))) {
                return res.status(200).json({
                    alreadyExists: true,
                    message: "Product is already in the wishlist"
                })
            }
            wishlist.products.push({
                product: productId,
            })
        }

        await wishlist.save()

        return res.status(200).json({
            success: true,
            message: "Product added to Wishlist"
        })
    } catch (error) {
        console.error(error)
    }
}

const getProducts = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.session.userId }).populate('products.product')

        if (wishlist) {
            return res.status(200).json(wishlist)
        } else {
            return res.status(200).json(wishlist)
        }
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ error: "Server error" })
    }
}

const removeProduct = async (req, res) => {
    try {
        const userId = req.session.userId
        const productId = req.body.productId
        const wishlist = await Wishlist.findOne({ user: userId })

        if (!wishlist) {
            return res.status(404).json({ message: "wishlist not found" })
        }

        const productIndex = wishlist.products.findIndex(element => element.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found" });
        }

        wishlist.products.splice(productIndex, 1)

        await wishlist.save();

        return res.status(200).json({ message: "Address deleted successfully" });
        
    } catch (error) {
        console.error(error)
    }
}

const getCount = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const wishlist = await Wishlist.findOne({user:userId})

        let wishlistCount = 0;

        if(wishlist && wishlist.products){
            wishlistCount = wishlist.products.length
        }
        res.status(200).json(wishlistCount)
    } catch (error) {
        console.error(error.message)
        res.status(500).json([])
    }
}

module.exports = {
    loadWishlist,
    addProduct,
    getProducts,
    removeProduct,
    getCount
}