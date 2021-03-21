const mongoose = require("mongoose");

const Store = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "please enter title"],
		},
		description: {
			type: String,
			required: [true, "please enter description"],
		},
		owner: {
			type: mongoose.Types.ObjectId,
			required: [true, "please type owner"],
            ref: "user"
		},
        books: [ {
            type: mongoose.Types.ObjectId,
			required: [true, "please type owner"],
            ref: "book"
        }],
        // ATM: {
        //     type: String,
		// 	required: [true, "please type owner"],
        //     ref: "book"
        // }
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("store", Store);
