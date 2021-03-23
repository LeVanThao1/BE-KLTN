const mongoose = require("mongoose");

const Category = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please enter name"],
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("category", Category);
