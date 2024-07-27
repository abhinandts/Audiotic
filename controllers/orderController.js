const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Orders = require('../models/ordersModel')
const Product = require('../models/productModel')
const { v4: uuidv4 } = require('uuid'); // 

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId

        const cartQuantities = await Cart.findOne({ user: userId }).populate({ path: 'cartProducts.product', select: 'productName stock' })

        for (let item of cartQuantities.cartProducts) {
            if (item.quantity > item.product.stock) {
                return res.status(400).json({
                    message: `${item.product.productName} is only ${item.product.stock} left in stock, Requested : ${item.quantity}`
                })
            }
        }


        const address = req.params
        const addressId = address.addressId

        const cart = await Cart.findOne({ user: userId })

        const addresses = await Address.findOne({ user: userId })
        const selectedAddress = addresses.address.find(item => item._id.toString() == addressId)

        const shipping = cart.cartTotal > 20000 ? 0 : 500;
        // Create a new order
        const order = new Orders({
            user: userId,
            orderId: uuidv4(), // Generate a unique order ID
            products: cart.cartProducts.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.subtotal / item.quantity // Assuming subtotal is price * quantity
            })),
            orderTotal: cart.cartTotal,
            shipping: shipping,
            status: "pending",
            address: {
                addressName: selectedAddress.addressName,
                street: selectedAddress.street,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pinCode: selectedAddress.pinCode,
                country: selectedAddress.country
            }
        })
        // Save the order
        await order.save()

        for (let item of cart.cartProducts) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            })
        }

        // Clear the user's cart after placing the order
        await Cart.findOneAndUpdate({ user: userId }, { $set: { cartProducts: [], cartSubtotal: 0, cartTotal: 0 } })


        let orderId = order.orderId

        res.redirect(`/orders/orderConfirmation/${orderId}`);

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "An error occurred while placing the order" })
    }
}

const orderConfirmation = async (req, res) => {
    try {
        const order = await Orders.findOne({ orderId: req.params.orderId }).populate("products.product")
        console.log(order)
        if (order.orderTotal > 2000)
            res.render('orderConfirmedPage', { order, header: true, smallHeader: false, breadcrumb: "order confirmed", footer: true })
    } catch (error) {
        console.error(error)
    }
}


const getOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find({ user: req.session.userId }).lean();
        console.log(allOrders);

        if (!allOrders || allOrders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        const orders = allOrders.map(order => {
            const date = new Date(order.orderDate);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            console.log(`${formattedDate} ${formattedTime}`);

            return {
                date: `${formattedDate} ${formattedTime}`,
                orderId: order.orderId,
                totalPrice: order.orderTotal,
                status: order.status
            };
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};






const trackOrder = async (req, res) => {
    try {
        const order = await Orders.findOne({ orderId: req.params.orderId })

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Optionally, you can populate the product details if needed
        // await order.populate('products.product').execPopulate();

        res.json(order);
    } catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


// ---------------------------------------------------
const loadOrders = async (req, res) => {
    try {
        console.log("orders")

    } catch (error) {
        console.error("Error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    placeOrder,
    orderConfirmation,
    getOrders,
    trackOrder,
    loadOrders
}