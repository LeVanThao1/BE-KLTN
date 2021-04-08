const mongoose = require("mongoose");

const NotificationGeneral = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "please enter title"],
        },
        description: {
            type: String,
            required: [true, "please enter description"],
        },
        to: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    required: [true, "please author"],
                    ref: "user",
                },
                seen: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
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

module.exports = mongoose.model("notificationGeneral", NotificationGeneral);
