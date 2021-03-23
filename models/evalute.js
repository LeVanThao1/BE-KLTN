const mongoose = require("mongoose");

const Evalute = mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "please enter content"],
        },
        store: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter store"],
            ref: "store",
        },
        star: {
            type: Number,
            min: 0,
            max: 5,
            required: [true, "please enter star"],
        },
        author: {
            type: mongoose.Types.ObjectId,
            required: [true, "please author"],
            ref: "user",
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("evalute", Evalute);
