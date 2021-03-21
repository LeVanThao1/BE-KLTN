const mongoose = require("mongoose");

const Comment = mongoose.Schema(
	{
		content: {
			type: String,
			required: [true, "please enter title"],
		},
		post: {
			type: mongoose.Types.ObjectId,
			required: [true, "please enter post"],
			ref: "post"
		},
		replyTo: {
			type: mongoose.Types.ObjectId,
			required: [true, "please enter reciver"],
            ref: "user"
		},
		author: {
			type: mongoose.Types.ObjectId,
			required: [true, "please author"],
			ref: "user"
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("comment", Comment);
