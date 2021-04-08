const mongoose = require("mongoose");

const NotificationOrder = mongoose.Schema(
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
        order: {
            type: mongoose.Types.ObjectId,
            required: [true, "please subOrder"],
            ref: "subOrder",
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

module.exports = mongoose.model("notificationOrder", NotificationOrder);
