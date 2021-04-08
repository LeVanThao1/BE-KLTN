const mongoose = require("mongoose");

const CommentPost = mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "please enter title"],
        },
        type: {
            type: String,
            enum: ["TEXT", "VIDEO", "IMAGE"],
            required: [true, "please type"],
            default: "TEXT",
        },
        post: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter post"],
            ref: "post",
        },
        // replyTo: {
        //     type: mongoose.Types.ObjectId,
        //     required: [true, "please enter reciver"],
        //     ref: "user",
        // },
        author: {
            type: mongoose.Types.ObjectId,
            required: [true, "please author"],
            ref: "user",
        },
        reply: [
            {
                type: mongoose.Types.ObjectId,
                ref: "comment",
            },
        ],
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("commentPost", CommentPost);
