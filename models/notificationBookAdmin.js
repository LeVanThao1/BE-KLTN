const mongoose = require("mongoose");

const NotificationBookAdmin = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "please enter title"],
        },
        description: {
            type: String,
            required: [true, "please enter description"],
        },
        data: {
            name: {
                type: String,
            },
            unsignedName: {
                type: String,
                default: null
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
        seen: {
            type: Boolean,
            default: false,
        },
        uniqueBook: {
            type: mongoose.Types.ObjectId,
            ref: "uniqueBook",
        },
        status: {
            type: String,
            enum: ["ADD", "UPDATE"],
            required: [true, "please enter status"],
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("notificationBookAdmin", NotificationBookAdmin);
