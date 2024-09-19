const dotenv = require('dotenv');
dotenv.config();

const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Address = require('../models/addressModel')
const Orders = require('../models/ordersModel')
const Product = require('../models/productModel')
const Wallet = require('../models/walletModel')
const Transaction = require('../models/transactionModel')

const crypto = require('crypto')
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


const loadCheckout = async (req, res) => {
    try {
        const couponId = req.query.couponId;
        const userId = req.session.userId;

        const userWallet = await Wallet.findOne({ user: userId })

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

        } else {
            console.log("no coupon", couponValue)
        }

        const shipping = cartSubtotal - couponValue > 2000 ? 0 : 500;
        const cartTotal = cartSubtotal - couponValue + shipping;

        let cod = false
        let wallet = false
        if (userWallet.money > cartSubtotal) {
            wallet = true
        }
        if (cartTotal < 2000) {
            cod = true
        }

        const cartData = {
            cartProducts,
            cartSubtotal,
            couponValue,
            shipping,
            cartTotal,
        }

        res.render('checkoutPage', { cartData, cod, wallet, header: false, smallHeader: true, breadcrumb: "Checkout", footer: false })
    } catch (error) {
        console.error(error);
    }
}

const placeOrder = async (req, res) => {
    try {
        const { userId } = req.session;
        const { couponId, addressId, paymentMethod } = req.body;

        // Fetch cart and validate stock
        const cart = await validateCartAndStock(userId);

        // cart total
        const { cartProducts, cartSubtotal } = await calculateCartTotals(cart);

        // coupon
        const { appliedCoupon, couponDiscount } = await validateAndApplyCoupon(couponId, cartSubtotal)

        // Address
        const address = await getSelectedAddress(userId, addressId)

        const shipping = calculateShipping(cartSubtotal)

        // Order total
        const orderTotalAfterDiscount = (cartSubtotal - couponDiscount) + shipping;

        const order = await createOrder(userId, cart, orderTotalAfterDiscount, shipping, address, appliedCoupon, couponDiscount, paymentMethod);

        switch (paymentMethod) {
            case 'Cash on Delivery':
                return handleCODOrder(order, userId, res);
            case 'Wallet':
                return handleWalletOrder(order, userId, orderTotalAfterDiscount, res);
            case 'Razorpay':
                return initializeRazorpayOrder(order, res);
            default:
                throw new Error('Invalid payment method');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while placing the order" });
    }
};


const verifyRazorpaySignature = (razorpayOrder, response) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpayOrder.id}|${response.razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    return digest === response.razorpay_signature;
};

const verifyPayment = async (req, res) => {
    try {
        const { response, razorpayOrder } = req.body;
        const userId = req.session.userId;

        if (verifyRazorpaySignature(razorpayOrder, response)) {
            const order = await Orders.findOneAndUpdate(
                { orderId: razorpayOrder.receipt },
                { $set: { paymentStatus: "Paid" } }
            );

            await finalizeOrder(userId);

            res.json({ status: 'ok', redirect: `/orders/orderConfirmation/${order.orderId}` });
        } else {
            await handleFailedPayment(razorpayOrder.receipt);
            res.status(400).json({ status: 'failed', message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const handleFailedPayment = async (orderId) => {
    await Orders.findOneAndUpdate(
        { orderId: orderId },
        { $set: { paymentStatus: "Failed" } }
    );

    console.log("Payment failed")
    // You can add more logic here, like sending a notification to the user
};






// ---- Helper functions ----

const handleCODOrder = async (order, userId, res) => {
    await finalizeOrder(userId);
    return res.status(200).json({ orderId: order.orderId });
};

const handleWalletOrder = async (order, userId, orderTotal, res) => {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.money < orderTotal) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
    }
    await Orders.findOneAndUpdate(
        { orderId: order.orderId },
        { $set: { paymentStatus: "Paid" } }
    )

    wallet.money -= orderTotal;

    await wallet.save()


    const transaction = new Transaction({
        transactionId : `txn_${new Date().getTime()}`,
        walletId : wallet._id,
        type:'Purchase',
        amount:orderTotal,
        referenceId:order.orderId
    })

    await transaction.save();
    

    await finalizeOrder(userId);
    return res.status(200).json({ orderId: order.orderId });
};

const initializeRazorpayOrder = async (order, res) => {
    const razorpayOrder = await generateRazorpay(order.orderId, order.orderTotal);
    return res.status(200).json(razorpayOrder);
};

const finalizeOrder = async (userId) => {
    await Promise.all([
        updateProductStock(userId),
        clearUserCart(userId)
    ]);
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
        return order
    } catch (error) {
        console.error(error.message)
        throw error;
    }
}


const validateCartAndStock = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate({
        path: 'cartProducts.product',
        select: 'productName stock price'
    });

    for (const item of cart.cartProducts) {
        if (item.quantity > item.product.stock) {
            throw new Error(`${item.product.productName} is only ${item.product.stock} left in stock, Requested: ${item.quantity}`);
        }
    }
    return cart;
};

const calculateCartTotals = async (cart) => {
    let cartSubtotal = 0;

    let cartProducts = cart.cartProducts.map(item => {
        let subtotal = item.product.price * item.quantity;
        cartSubtotal += subtotal;

        return { ...item.toObject(), subtotal }
    })

    return { cartProducts, cartSubtotal }
}

const validateAndApplyCoupon = async (couponId, cartSubtotal) => {
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponId) {
        appliedCoupon = await Coupon.findById(couponId);
        if (appliedCoupon && appliedCoupon.minimumAmount <= cartSubtotal) {
            couponDiscount = appliedCoupon.value
        }
    }
    return { appliedCoupon, couponDiscount }
}

const getSelectedAddress = async (userId, addressId) => {
    const addresses = await Address.findOne({ user: userId })
    return addresses.address.find(item => item._id.toString() === addressId)
}

const calculateShipping = (cartSubtotal) => cartSubtotal > 1000 ? 0 : 500;

const createOrder = async (userId, cart, orderTotalAfterDiscount, shipping, address, coupon, couponDiscount, paymentMethod) => {
    const orderId = `${getRandomElement(figures)}-${getRandomElement(objects)}-${Date.now()}`;

    const order = new Orders({
        user: userId,
        orderId: orderId,
        products: cart.cartProducts.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        })),
        orderTotal: orderTotalAfterDiscount,
        shipping,
        address: {
            addressName: address.addressName,
            street: address.street,
            city: address.city,
            state: address.state,
            pinCode: address.pinCode,
            country: address.country
        },
        couponUsed: coupon ? coupon._id : null,
        couponDiscount,
        paymentMethod,

    });

    await order.save();
    return order;
};

const updateProductStock = async (userId) => {
    const cart = await Cart.findOne({ user: userId })
    const bulkOps = cart.cartProducts.map(item => ({
        updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { stock: -item.quantity } }
        }
    }));

    await Product.bulkWrite(bulkOps);
};

const clearUserCart = async (userId) => {
    await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { cartProducts: [] } }
    )
}

const updateUserWallet = async (userId, orderTotalAfterDiscount) => {

    const wallet = await Wallet.findOne({ user: userId })

    if (wallet) {
        wallet.money = wallet.money - orderTotalAfterDiscount
        wallet.save()
    } else {
        return res.status(404).json({ success: false, message: 'Wallet is not found' })
    }
}

const figures = [
    'Einstein', 'Newton', 'Tesla', 'Curie', 'Galileo',
    'Aristotle', 'DaVinci', 'Darwin', 'Hawking', 'Edison',
    'Babbage', 'Archimedes', 'Feynman', 'Turing', 'Copernicus',
    'Pythagoras', 'Kepler', 'Marie Curie', 'Mendel', 'Lovelace',
    'Faraday', 'Bohr', 'Fibonacci', 'Pascal', 'Franklin'
];

const objects = [
    'Book', 'Lamp', 'Rocket', 'Wheel', 'Compass',
    'Telescope', 'Abacus', 'Globe', 'Scroll', 'Hammer',
    'Gadget', 'Mirror', 'Quill', 'Key', 'Gavel',
    'Chalice', 'Sundial', 'Map', 'Odometer', 'Flask',
    'Satchel', 'Inkwell', 'Lens', 'Sextant', 'Hourglass'
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const orderId = `${getRandomElement(figures)}-${getRandomElement(objects)}-${Date.now()}`;


module.exports = {
    loadCheckout,
    placeOrder,
    verifyPayment
}