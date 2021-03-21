const mongoose = require("mongoose");

const NotificationGeneral = mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "please enter title"],
		},
		description: {
			type: String,
            required: [true, "please enter description"],
		},
		to: [{
			type: mongoose.Types.ObjectId,
			required: [true, "please author"],
			ref: "user"
		}],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("notificationGeneral", NotificationGeneral);
