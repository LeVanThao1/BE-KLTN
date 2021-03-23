const mongoose = require("mongoose");

const Photo = mongoose.Schema(
    {
        url: {
            type: String,
            required: [true, "please enter secure_url"],
        },
        name: {
            type: String,
            required: [true, "please enter name"],
        },
        asset_id: {
            type: String,
            required: [true, "please enter asset_id"],
        },
        public_id: {
            type: String,
            required: [true, "please enter public_id"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("photo", Photo);
