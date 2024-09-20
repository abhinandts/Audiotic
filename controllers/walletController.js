const dotenv = require('dotenv');
dotenv.config();

const Transaction = require('../models/transactionModel')
const Wallet = require('../models/walletModel')

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


const rechargeWallet = async (req, res) => {
    try {
        const { rechargeAmount } = req.body;

        const orderId = generateOrderId()

        return initializeRazorpayOrder(orderId, rechargeAmount, res);

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "An error occurred while payment" });
    }
}

const verifyPayment = async (req, res) => {
    try {
        const { response, razorpayOrder } = req.body;
        const userId = req.session.userId;

        if (verifyRazorpaySignature(razorpayOrder, response)) {
            const money = razorpayOrder.amount/100

            const wallet = await Wallet.findOne({ user: userId })
            wallet.money = wallet.money + money

            await wallet.save()

            const transaction = new Transaction({
                transactionId: `txn_${new Date().getTime()}`,
                walletId: wallet._id,
                type: 'Top-Up',
                amount: money,
                referenceId: razorpayOrder.id
            })

            await transaction.save();

            res.json({ status: 'ok', redirect: `/myAccount` });
        } else {
            await handleFailedPayment(razorpayOrder.receipt);
            res.status(400).json({ status: 'failed', message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// ---- HELPERS


const verifyRazorpaySignature = (razorpayOrder, response) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpayOrder.id}|${response.razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    return digest === response.razorpay_signature;
};


const initializeRazorpayOrder = async (orderId, rechargeAmount, res) => {
    const razorpayOrder = await generateRazorpay(orderId, rechargeAmount);
    return res.status(200).json(razorpayOrder);
}

const generateRazorpay = async (orderId, rechargeAmount) => {
    try {
        const options = {
            amount: rechargeAmount * 100,
            currency: 'INR',
            receipt: orderId,
            payment_capture: '1'
        }
        const order = await razorpayInstance.orders.create(options)
        return order
    } catch (error) {
        console.error(error)
    }
}

const generateOrderId = function () {
    return 'Top-Up' + Date.now()
}

module.exports = {
    rechargeWallet,
    verifyPayment
}