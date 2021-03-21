const mongoose = require("mongoose");

const Message = mongoose.Schema(
	{
		content: {
			type: String | Object,
			required: [true, "please enter title"],
		},
        images: [
            {
                type: String,
            }
        ],
		datetime: {
			type: Date,
			required: [true, "please enter date"],
		},
		to: {
			type: mongoose.Types.ObjectId,
			required: [true, "please enter group"],
            ref: "group"
		},
		from: {
			type: mongoose.Types.ObjectId,
			required: [true, "please author"],
			ref: "user"
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("message", Message);
