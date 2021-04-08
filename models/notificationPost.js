const mongoose = require("mongoose");

const NotificationPost = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "please enter title"],
        },
        description: {
            type: String,
            required: [true, "please enter description"],
        },
        to: {
            type: mongoose.Types.ObjectId,
            required: [true, "please author"],
            ref: "user",
        },
        commentPost: {
            type: mongoose.Types.ObjectId,
            required: [true, "please post"],
            ref: "commentPost",
        },
        seen: {
            type: Boolean,
            default: false,
        },
        image: {
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

module.exports = mongoose.model("notificationPost", NotificationPost);
