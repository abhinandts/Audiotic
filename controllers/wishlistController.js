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

module.exports = {
    loadWishlist,
    addProduct
}