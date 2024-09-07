const dotenv = require('dotenv');
dotenv.config();

const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Address = require('../models/addressModel')
const Orders = require('../models/ordersModel')
const Product = require('../models/productModel')
const crypto = require('crypto')

const Razorpay = require('razorpay');

const { v4: uuidv4 } = require('uuid');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// -------------------------------------------------------

const loadCheckout = async (req, res) => {
    try {
        const couponId = req.query.couponId;
        const userId = req.session.userId

        const cart = await Cart.findOne({ user: userId }).populate({ path: 'cartProducts.product', select: 'price stock productName image' })
        if (!cart) {
            return res.status(404).render('error', { message: 'cart not found' });
        }

        let cartSubtotal = 0;
        const cartProducts = cart.cartProducts.map(item => {
            const subtotal = item.product.price * item.quantity;
            cartSubtotal += subtotal;
            return {
                ...item.toObject(),
                subtotal
            };
        })

        let couponValue = 0

        if (couponId) {
            const coupon = await Coupon.findById(couponId);

            if (cartSubtotal >= coupon.minimumAmount && cartSubtotal > coupon.value) {
                couponValue = coupon.value;
            }
            console.log(couponValue)

        } else {
            console.log("no coupon", couponValue)
        }

        const shipping = cartSubtotal - couponValue > 10000 ? 0 : 500;
        const cartTotal = cartSubtotal - couponValue + shipping;
        let cod = false
        if (cartTotal < 1000) {
            cod = true
        }

        const cartData = {
            cartProducts,
            cartSubtotal,
            couponValue,
            shipping,
            cartTotal,
        }

        res.render('checkoutPage', { cartData, header: false, smallHeader: true, breadcrumb: "Checkout", footer: false, cod })
    } catch (error) {
        console.error(error);
    }
}

const placeOrder = async (req, res) => {
    try {
        console.log(req.body)
        const userId = req.session.userId;
        const couponId = req.body.couponId;
        const addressId = req.body.addressId;
        const razorpay = req.body.razorpay

        // Fetch cart and validate stock
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'cartProducts.product',
            select: 'productName stock price'
        });

        for (let item of cart.cartProducts) {
            if (item.quantity > item.product.stock) {
                return res.status(400).json({
                    message: `${item.product.productName} is only ${item.product.stock} left in stock, Requested : ${item.quantity}`
                });
            }
        }

        let cartSubtotal = 0;

        const cartProducts = cart.cartProducts.map(item => {
            const subtotal = item.product.price * item.quantity;
            cartSubtotal += subtotal;
            return {
                ...item.toObject(),
                subtotal
            };
        })

        // Fetch and validate coupon
        let couponDiscount = 0;
        let appliedCoupon = null;
        if (couponId) {
            appliedCoupon = await Coupon.findById(couponId);

            if (appliedCoupon && cartSubtotal >= appliedCoupon.minimumAmount) {

                couponDiscount = Math.min(appliedCoupon.value, cartSubtotal);
            }
        }

        const addresses = await Address.findOne({ user: userId });
        const selectedAddress = addresses.address.find(item => item._id.toString() == addressId);

        const shipping = cartSubtotal > 20000 ? 0 : 500;

        const orderTotalAfterDiscount = cartSubtotal - couponDiscount;

        // Create a new order
        const order = new Orders({
            user: userId,
            orderId: uuidv4(),
            products: cart.cartProducts.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            orderTotal: orderTotalAfterDiscount,
            shipping: shipping,
            address: {
                addressName: selectedAddress.addressName,
                street: selectedAddress.street,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pinCode: selectedAddress.pinCode,
                country: selectedAddress.country
            },
            couponUsed: appliedCoupon ? appliedCoupon._id : null,
            couponDiscount: couponDiscount,
            isRazorpay: razorpay

        });

        // Save the order
        await order.save();

        const orderId = order.orderId;

        // Update product stock
        for (let item of cart.cartProducts) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear the user's cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { cartProducts: [], cartSubtotal: 0, cartTotal: 0 } }
        );

        // Update coupon usage if a coupon was applied
        if (appliedCoupon) {
            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
                $push: { usedBy: userId },
                $inc: { usageCount: 1 }
            });
        }

        if (razorpay) {
            const amount = order.orderTotal;
            const razorpayOrder = await generateRazorpay(order.orderId, amount);
            return res.status(200).json(razorpayOrder);
        } else {
            res.redirect(`/orders/orderConfirmation/${order.orderId}`);
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while placing the order" });
    }
};


const generateRazorpay = async (orderId, amount) => {

    try {
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: orderId,
            payment_capture: '1'
        }
        const order = await razorpayInstance.orders.create(options);
        console.log(order)
        return order
    } catch (error) {
        console.error(error.message)
    }
}

const verifyPayment = async (req, res) => {
    try {
        console.log("inside the verifyPayment")

        const { orderDetails, response } = req.body
        console.log(orderDetails)

        const secret = process.env.RAZORPAY_KEY_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(orderDetails.id + "|" + response.razorpay_payment_id)
        const digest = shasum.digest('hex');

        if (digest === response.razorpay_signature) {
            console.log("Payment verified successfully");
            const order = await Orders.findOneAndUpdate({ orderId: orderDetails.receipt }, { $set: { payment: true } })

            res.json({ status: 'ok' });
        } else {
            console.log("Payment verification failed");
            res.status(400).json({ staus: 'failed' })
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    loadCheckout,
    placeOrder,
    verifyPayment
}