const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Orders = require('../models/ordersModel')
const { v4: uuidv4 } = require('uuid'); // 

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId
        const address = req.params
        const addressId = address.addressId

        const cart = await Cart.findOne({ user: userId })

        const addresses = await Address.findOne({ user: userId })
        const selectedAddress = addresses.address.find(item => item._id.toString() == addressId)

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
        const order = await Orders.find({ orderId: req.params.orderId })
        console.log(order)
        res.render('orderConfirmedPage', { order, header: true, smallHeader: false, breadcrumb: "order confirmed", footer: true })
    } catch (error) {
        console.error(error)
    }
}

const getOrders = async (req, res) => {
    try {
        const allOrders = await Orders.findOne({ user: req.session.userId })

        if (!allOrders) {
            return res.status(404).json({ message: "No orders found" });
        }

        const orders = allOrders.map(order => {
            const date = new Date(order.orderDate);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;

            return {
                date: formattedDate,
                orderId: order.orderId,
                totalPrice: order.orderTotal,
                status: order.status
            };
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error })
    }
}

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
const loadOrders = async(req,res)=>{
    try {
        console.log("orders")
        
    } catch (error) {
        console.error("Error ",error);
        res.status(500).json({message:"Internal server error"});
    }
}

module.exports = {
    placeOrder,
    orderConfirmation,
    getOrders,
    trackOrder,
    loadOrders
}