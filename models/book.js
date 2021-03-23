const mongoose = require("mongoose");

const Book = mongoose.Schema(
    {
        book: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter book"],
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
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("book", Book);
