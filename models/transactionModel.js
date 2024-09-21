const mongoose = require('mongoose')
const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['Purchase', 'Return', 'Cancellation', 'Top-Up'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    referenceId: {
        type: String,
        default: null
    },
});

module.exports = mongoose.model('Transaction', transactionSchema);