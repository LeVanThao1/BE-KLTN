const mongoose = require('mongoose');

const SubOrder = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            required: [true, 'please enter user'],
            ref: 'user',
        },
        detail: {
            book: {
                type: mongoose.Types.ObjectId,
                required: [true, 'please enter book'],
                ref: 'book',
            },
            amount: {
                type: Number,
                required: [true, 'please enter amount'],
            },
            price: {
                type: Number,
                required: [true, 'please enter price'],
            },
        },
        store: {
            type: mongoose.Types.ObjectId,
            required: [true, 'please enter store'],
            ref: 'stroe',
        },
        typePayment: {
            type: String,
            enum: ['ONLINE', 'AFTERRECEIVED'],
            default: 'AFTERRECEIVED',
        },
        statusPayment: {
            type: String,
            enum: ['UNPAID', 'PAID'],
            default: 'UNPAID',
        },
        ship: {
            type: Number,
            min: 0,
            default: 0,
        },
        note: {
            type: String,
            default: '',
        },
        dateOfPayment: {
            type: Date,
        },
        address: {
            type: String,
            min: 10,
            max: 100,
            required: [true, 'please enter address'],
        },
        phone: {
            type: String,
            len: 10,
            required: [true, 'please enter phone'],
        },
        status: {
            type: String,
            enum: ['CANCLE', 'WAITING', 'CONFIRMED', 'PROCESSING', 'DONE'],
            default: 'WAITING',
        },
        receivedDate: {
            type: Date,
        },
        deliveryDate: {
            type: Date,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('subOrder', SubOrder);
