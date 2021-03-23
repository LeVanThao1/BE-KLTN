const mongoose = require("mongoose");

const Group = mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Types.ObjectId,
                required: [true, "please enter member"],
                ref: "user",
            },
        ],
        // messages: [{
        // 	type: mongoose.Types.ObjectId,
        // 	required: [true, "please enter message"],
        // 	ref: "message"
        // }],
        lastMassage: {
            type: mongoose.Types.ObjectId,
            // required: [true, "please enter message"],
            ref: "message",
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("group", Group);
