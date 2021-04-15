const mongoose = require("mongoose");

const Store = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please enter title"],
            unique: true,
        },
        unsignedName: {
            type: String,
            default: null
        },
        avatar: {
            type: String,
            required: [true, "please enter avatar"],
        },
        background: {
            type: String,
        },
        description: {
            type: String,
            required: [true, "please enter description"],
        },
        owner: {
            type: mongoose.Types.ObjectId,
            required: [true, "please type owner"],
            ref: "user",
        },
        verified: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("store", Store);
