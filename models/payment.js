const mongoose = require("mongoose");

const Payment = mongoose.Schema(
	{
		order: {
			type: mongoose.Types.ObjectId,
			required: [true, "order is required"],
		},
        type: {
            type: String,
            enum: ["Online", "AfterReceiced"]
        }
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("payment", Payment);
