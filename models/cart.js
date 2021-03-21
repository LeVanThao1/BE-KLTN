const mongoose = require("mongoose");

const Cart = mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			required: [true, "please enter user"],
            ref:"user"
		},
        books: [
            {
                book: {
                    type: mongoose.Types.ObjectId,
                    required: [true, "please enter book"],
                    ref: "book"
                },
                amount: {
                    type: Number,
                    required: [true, "please enter amount"],
                },
                price: {
                    type: Number,
                    required: [true, "please enter price"],
                }
            }
        ]
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("cart", Cart);
