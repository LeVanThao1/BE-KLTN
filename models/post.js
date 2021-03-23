const mongoose = require("mongoose");

const Post = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "please enter title"],
        },
        uniqueBook: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter unique book"],
            ref: "uniqueBook",
        },
        description: {
            type: String,
            required: [true, "please enter description"],
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

module.exports = mongoose.model("post", Post);
