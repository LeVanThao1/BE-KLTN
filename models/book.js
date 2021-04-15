const mongoose = require('mongoose');

const Book = mongoose.Schema(
    {
        book: {
            type: mongoose.Types.ObjectId,
            ref: 'uniqueBook',
            default: null
        },
        store: {
            type: mongoose.Types.ObjectId,
            required: [true, 'please enter store'],
            ref: 'store',
        },
        amount: {
            type: Number,
            min: 0,
            required: [true, 'please enter amount'],
        },
        price: {
            type: Number,
            min: 0,
            required: [true, 'please enter price'],
        },
        sold: {
            type: Number,
            min: 0,
            default: 0,
        },
        deletedAt: {
            type: Date,
        },
        name: {
            type: String,
            default: null
        },
        unsignedName: {
            type: String,
            default: null
        },
        images: [
            {
                type: String,
            },
        ],
        year: {
            type: String,
            default: null
        },
        numberOfReprint: {
            type: Number,
            min: 0,
            default: null
        },
        publisher: {
            type: String,
            default: null
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'category',
            default: null
        },
        description: {
            type: String,
            default: null
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('book', Book);
