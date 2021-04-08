const mongoose = require("mongoose");

const NotificationBook = mongoose.Schema(
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
        commentBook: {
            type: mongoose.Types.ObjectId,
            required: [true, "please book"],
            ref: "commentBook",
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

module.exports = mongoose.model("notificationBook", NotificationBook);
