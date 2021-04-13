const mongoose = require("mongoose");

const BookExchange = mongoose.Schema(
    {
        book: {
            type: mongoose.Types.ObjectId,
            ref: "uniqueBook",
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
        numberOfPageCurrent: {
            type: Number,
            required: [true, "please enter numberPage"],
        },
        amount: {
            type: Number,
            required: [true, "please enter amount"],
            min: 1,
            default: 1,
        },
        status: {
            type: String,
            required: [true, "please enter status"],
            enum: ["NEW", "LIKENEW", "OLD"],
        },
        usedDay: {
            type: Number,
            required: [true, "please enter used day"],
            min: 0,
        },
        numberOfPage: {
            type: Number,
            required: [true, "please enter numberPage"],
        },
        priceBuyNew: {
            type: Number,
            required: [true, "please enter priceBuyNew"],
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("bookExchange", BookExchange);
