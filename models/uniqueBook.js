const mongoose = require("mongoose");

const UniqueBook = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please enter title"],
        },
        images: [
            {
                type: String,
                required: [true, "please upload image"],
            },
        ],
        year: {
            type: String,
            required: [true, "please enter year"],
        },
        numberOfReprint: {
            type: Number,
            min: 0,
            required: [true, "please enter numberOfReprint"],
        },
        publisher: {
            type: String,
            required: [true, "please enter publisher"],
        },
        category: {
            type: mongoose.Types.ObjectId,
            required: [true, "please enter category"],
            ref: "category",
        },
        description: {
            type: String,
            required: [true, "please enter description"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("uniqueBook", UniqueBook);
