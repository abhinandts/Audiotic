const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Orders = require('../models/ordersModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
const Transaction = require('../models/transactionModel')


const orderConfirmation = async (req, res) => {
    try {
        const order = await Orders.findOne({ orderId: req.params.orderId }).populate("products.product")
        res.render('orderConfirmedPage', { order, header: true, smallHeader: false, breadcrumb: "order confirmed", footer: true })
    } catch (error) {
        console.error(error)
    }
}

const getOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find({ user: req.session.userId }).lean();

        if (!allOrders || allOrders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        const orders = allOrders.map(order => {
            const date = new Date(order.createdAt);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            return {
                date: `${formattedDate} ${formattedTime}`,
                orderId: order.orderId,
                totalPrice: order.orderTotal,
                status: order.orderStatus
            };
        });

        res.status(200).json(orders);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const order = await Orders.findOne({ orderId }).populate('products.product')

        if (!order) {
            return res.render('myAccount', { message: "Order not found" });
        }
        res.render('orderConfirmedPage', { order, header: true, smallHeader: false, breadcrumb: "order confirmed", footer: true })

    } catch (error) {
        console.error(error)
    }
}


const trackOrder = async (req, res) => {
    try {
        const id = req.body.orderId.trim()
        const order = await Orders.findOne({ orderId: id }).populate('products.product')

        if (!order) {
            return res.render('myAccount', { message: "Order not found" });
        }

        res.render('orderConfirmedPage', { order, header: true, smallHeader: false, breadcrumb: "order confirmed", footer: true })

    } catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// -------------------------------------------------->

const loadOrderPage = async (req, res) => {
    try {
        const orders = await Orders.find({}, { orderId: 1, orderTotal: 1, createdAt: 1, orderStatus: 1, paymentStatus: 1 }).populate({ path: 'user', select: 'name email' })
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            order.formattedDate = formattedDate
        });
        res.render('orders', { orders, title: "Orders List", sidebar: true, header: true, footer: true })
    } catch (error) {
        console.error("Error ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const loadOrders = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit)

        const orders = await Orders.find().populate({
            path: 'user',
            select: 'email',
        }).select('createdAt orderId orderStatus paymentStatus orderTotal')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({ orders: orders, currentPage: page, totalPages: totalPages })

    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
}

const showOrder = async (req, res) => {
    try {
        const order = await Orders.findOne({ orderId: req.params.orderId }).populate({ path: 'user', select: 'name email mobile' }).populate({ path: 'products.product', select: 'productName price image' })

        let orderStatuses = [];

        if (["Processing", "Shipped"].includes(order.orderStatus)) {
            if (order.orderStatus === "Processing") {
                orderStatuses = ["Processing", "Shipped", "Delivered"];
            } else if (order.orderStatus === "Shipped") {
                orderStatuses = ["Shipped", "Delivered"];
            }
        }
        res.render("showOrder", { order, orderStatuses, title: "Order", sidebar: 'true', sidebar: true, header: false, footer: false })

    } catch (error) {
        console.error(error.message)
    }
}

const updateStatus = async (req, res) => {
    try {
        const id = req.body.orderId
        const orderStatus = req.body.orderStatus

        console.log(id)
        console.log(orderStatus)

        if (orderStatus === "Delivered") {

            await Orders.findByIdAndUpdate(id, { orderStatus: orderStatus, paymentStatus: "Paid" })

        } else {
            await Orders.findByIdAndUpdate(id, { orderStatus })
        }

        res.status(200).send({ message: "Order status successfully updated." });

    } catch (error) {
        console.log(error)
        res.status(500)
    }
}

const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.userId
        const id = req.body.orderId
        const reason = req.body.reason

        const order = await Orders.findById(id);
        console.log(order._id)

        let updatedOrder

        if (order.paymentMethod === "Cash on Delivery") {

            updatedOrder = await Orders.findByIdAndUpdate(id, { reason, orderStatus: 'Cancelled', paymentStatus: 'Not Applicable' })

        } else {
            const wallet = await Wallet.findOne({ user: userId })

            if (wallet) {
                wallet.money = wallet.money + order.orderTotal
                wallet.save()
            } else {
                return res.status(404).json({ success: false, message: 'Wallet is not found' })
            }

            const transaction = new Transaction({
                transactionId: `txn_${new Date().getTime()}`,
                walletId: wallet._id,
                type: 'Cancellation',
                amount: order.orderTotal,
                referenceId: order.id
            })

            await transaction.save();

            updatedOrder = await Orders.findByIdAndUpdate(id, { reason, orderStatus: 'Cancelled', paymentStatus: 'Refunded' })
        }

        if (updatedOrder) {
            return res.status(200).json({ success: true, message: 'Order cancelled successfully' })
        } else {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'An error occurred while cancelling the order' })
    }
}

const returnOrder = async (req, res) => {
    try {
        const userId = req.session.userId
        const orderId = req.body.orderId
        const reason = req.body.reason

        const order = await Orders.findById(orderId);
        const wallet = await Wallet.findOne({ user: userId })

        if (wallet) {
            wallet.money = wallet.money + order.orderTotal
            wallet.save()
        } else {
            console.error(error)
            return res.status(404).json({ success: false, message: 'Wallet is not found' })
        }

        const transaction = new Transaction({
            transactionId: `txn_${new Date().getTime()}`,
            walletId: wallet._id,
            type: 'Return',
            amount: order.orderTotal,
            referenceId: order.id
        })
        await transaction.save();

        const updatedOrder = await Orders.findByIdAndUpdate(orderId, { reason, orderStatus: 'Returned', paymentStatus: "Refunded" }, { new: true })

        if (updatedOrder) {
            return res.status(200).json({ success: true, message: 'Order Returned successfull' })
        } else {
            return res.status(404).json({ success: false, message: 'An error occured while returning the order' })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "An error occured while returning the order" })
    }
}


// --------------sales page 

const salesPage = async (req, res) => {
    try {
        res.render("salesPage", { title: "Sales", sidebar: 'true', sidebar: true, header: false, footer: false })

    } catch (error) {
        console.error(error)
    }
}
const loadSalesOrders = async (req, res) => {
    try {
        const orders = await Orders.find({ orderStatus: "Delivered" })
            .populate({
                path: 'user',          // Path to populate the 'user' field
                select: 'email'        // Select only the 'email' field from the User model
            })
            .select('createdAt orderId paymentMethod paymentStatus orderTotal') // Select specific fields from the Orders model
            .exec();

        res.status(200).json(orders)
    } catch (error) {
        console.error(error)
    }
}

const filter = async (req, res) => {
    try {
        const value = req.query.filter;

        const currentDate = new Date();

        let dateThreshold;

        if (value === '7days') {
            dateThreshold = new Date(currentDate.setDate(currentDate.getDate() - 7));
        } else if (value === '30days') {
            dateThreshold = new Date(currentDate.setDate(currentDate.getDate() - 30));
        }

        const query = { orderStatus: "Delivered" }

        if (dateThreshold) {
            query.createdAt = { $gte: dateThreshold };
        }

        const orders = await Orders.find(query).populate({
            path: 'user',
            select: 'email',
        }).select('createdAt orderId paymentMethod paymentStatus orderTotal')
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json(orders);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getChartData = async (req, res) => {

    try {

        let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        const deliveredOrdersPerMonth = await Orders.aggregate([
            { $match: { orderStatus: "Delivered" } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ]);

        let deliveredOrdersArray = new Array(12).fill(0);

        deliveredOrdersPerMonth.forEach((order) => {
            deliveredOrdersArray[order._id.month - 1] = order.totalOrders; // -1 since month is 1-based
        });


        const returnedOrdersPerMonth = await Orders.aggregate([
            { $match: { orderStatus: "Returned" } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ]);

        let returnedOrdersArray = new Array(12).fill(0);

        returnedOrdersPerMonth.forEach((order) => {
            returnedOrdersArray[order._id.month - 1] = order.totalOrders; // -1 since month is 1-based
        });



        const cancelledOrdersPerMonth = await Orders.aggregate([
            { $match: { orderStatus: "Cancelled" } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ]);

        let cancelledOrdersArray = new Array(12).fill(0);

        cancelledOrdersPerMonth.forEach((order) => {
            cancelledOrdersArray[order._id.month - 1] = order.totalOrders; // -1 since month is 1-based
        });


        const data = { labels, deliveredOrders: deliveredOrdersArray,returnedOrders:returnedOrdersArray,cancelledOrders:cancelledOrdersArray }

        res.status(200).json(data)
    } catch (error) {

    }
}

module.exports = {
    orderConfirmation,
    getOrders,
    trackOrder,
    loadOrderPage,
    showOrder,
    updateStatus,
    getOrder,
    salesPage,
    loadSalesOrders,
    filter,
    loadOrders,

    getChartData,

    cancelOrder,
    returnOrder,
}