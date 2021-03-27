const mongoose = require("mongoose");

const Message = mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "please enter title"],
        },
        images: [
            {
                type: String,
            },
        ],
        datetime: {
            type: Date,
            required: [true, "please enter date"],
        },
        to: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter group"],
            ref: "group",
        },
        from: {
            type: mongoose.Types.ObjectId,
            required: [true, "please author"],
            ref: "user",
        },
        seen: {
            type: Date,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("message", Message);
