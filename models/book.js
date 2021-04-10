const mongoose = require("mongoose");

const Book = mongoose.Schema(
    {
        book: {
            type: mongoose.Types.ObjectId,
            ref: "uniqueBook",
        },
        store: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter store"],
            ref: "store",
        },
        amount: {
            type: Number,
            min: 0,
            required: [true, "please enter amount"],
        },
        price: {
            type: Number,
            min: 0,
            required: [true, "please enter price"],
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
        },
        images: [
            {
                type: String,
            },
        ],
        year: {
            type: String,
        },
        numberOfReprint: {
            type: Number,
            min: 0,
        },
        publisher: {
            type: String,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: "category",
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("book", Book);
