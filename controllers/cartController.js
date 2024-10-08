const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')

const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                cartProducts: [
                    {
                        product: productId,
                        quantity: 1,
                    },
                ],
            });
        } else {
            if (cart.cartProducts.some((item) => item.product.equals(productId))) {
                return res.status(200).json({
                    alreadyExists: true,
                    message: "Product is already in the cart",
                });
            }
            cart.cartProducts.push({
                product: productId,
                quantity: 1,
            });
        }
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Server error in server" });
    }
};

const loadCart = async (req, res) => {
    try {
        res.render('cartPage', { header: false, smallHeader: true, breadcrumb: "Cart", footer: true })
    } catch (error) {
        console.log(error.message)
    }
}

const getCount = async (req, res) => {
    try {
        const userId = req.session.userId;
        const cart = await Cart.findOne({ user: userId })

        let cartCount = 0;

        if (cart && cart.cartProducts) {
            cartCount = cart.cartProducts.length
        }
        res.status(200).json(cartCount)
    } catch (error) {
        console.log(error.message)
        return res.status(200).json([])
    }
}

const getProducts = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.session.userId })
            .populate({
                path: 'cartProducts.product',
                select: '_id name price stock offer image category is_active',
                populate: {
                    path: 'category',
                    model: 'Category',
                    select: 'name categoryOffer'
                }
            });

        if (!cart) {
            return res.status(200).json({ message: "cart is empty" });
        }

        let cartSubtotal = 0;

        const cartProducts = cart.cartProducts.map(item => {

            const product = item.product;
            const category = product.category;

            let offerPrice = product.price;

            if (product.offer > 0 && category.categoryOffer === 0) {
                offerPrice = product.price - (product.price * (product.offer / 100));
            } else if (product.offer === 0 && category.categoryOffer > 0) {
                offerPrice = product.price - (product.price * (category.categoryOffer / 100))
            } else if (product.offer > 0 && category.categoryOffer > 0) {
                const offer = Math.max(product.offer, category.categoryOffer)
                offerPrice = product.price - (product.price * (offer / 100))
            }

            const subtotal = offerPrice * item.quantity;
            cartSubtotal = cartSubtotal + subtotal;

            return {
                _id: product._id,
                name: product.name,
                offerPrice: offerPrice,
                quantity: item.quantity,
                subtotal: subtotal,
                image: product.image[0]
            }
        })

        const shipping = cartSubtotal > 2000 ? 0 : 500;
        const cartTotal = cartSubtotal + shipping;

        const cartData = {
            cartProducts,
            cartSubtotal,
            shipping,
            cartTotal
        }

        return res.status(200).json(cartData)

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "server error" })
    }
}



const removeFromCart = async (req, res) => {

    try {
        const productId = req.body.productId;
        const userId = req.session.userId;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }

        const productIndex = cart.cartProducts.findIndex(pro => pro.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found" });
        }

        cart.cartProducts.splice(productIndex, 1);

        await cart.save();

        cart.cartSubtotal = cart.cartProducts.reduce((total, item) => {
            return total = item.subtotal + total
        }, 0)
        cart.shipping = cart.cartSubtotal > 20000 ? 0 : 500
        cart.cartTotal = cart.cartSubtotal + cart.shipping

        await cart.save()

        res.status(200).json({ message: "Address deleted successfully" });

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error." })
    }
}

const updateQuantity = async (req, res) => {
    try {
        const productId = req.body.productId;
        const increment = req.body.increment;
        const userId = req.session.userId;

        const cart = await Cart.findOne({ user: userId }).populate({ path: 'cartProducts.product', select: 'productName price mrp stock discount quantity', });

        if (!cart) {
            return res.status(404).json({ message: "cart not found" });
        }

        const cartItem = cart.cartProducts.find(item => item.product._id.toString() == productId);


        if (cartItem) {

            if (increment) {
                cartItem.quantity += 1;
                if (cartItem.quantity > cartItem.product.stock) {
                    cartItem.quantity -= 1;
                    return res.status(400).json({ message: `Only ${cartItem.product.stock} left for this product.`, type: "warning" });
                }
            } else {
                cartItem.quantity -= 1;
            }

            await cart.save();

            return res.status(200).json({
                message: "Product quantity updated",
                quantity: cartItem.quantity
            });

        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error.", type: 'error' })
    }
}

module.exports = {
    loadCart,
    getCount,
    getProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
}