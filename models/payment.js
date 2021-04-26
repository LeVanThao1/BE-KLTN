const mongoose = require('mongoose');

const Payment = mongoose.Schema(
    {
        order: {
            type: mongoose.Types.ObjectId,
            required: [true, 'order is required'],
        },
        type: {
            type: String,
            enum: ['ONLINE', 'AFTERRECEIVED'],
            default: 'AFTERRECEIVED',
        },
        status: {
            type: String,
            enum: ['UNPAID', 'PAID'],
            default: 'UNPAID',
        },
        dateOfPayment: {
            type: Date,
        },
        infoPayment: {
            type: String,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('payment', Payment);
