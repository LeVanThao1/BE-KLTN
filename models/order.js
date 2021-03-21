const mongoose = require("mongoose");

const Order = mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			required: [true, "please enter user"],
            ref:"user"
		},
        subOrder: [
            {
                type: mongoose.Types.ObjectId,
                required: [true, "please enter sub order"],
                ref: "subOrder"
            }
        ],
        total: {
            type: Number,
            required: [true, "total is required"]
        },
        address: {
			type: String,
			min: 10,
			max: 100,
            required: [true, "please enter address"],
		},
        phone: {
			type: String,
			len: 10,
			required: [true, "please enter phone"],
		},
        status: {
            type: String,
            enum: ["WAITING","CONFIRMED", "PROCESSING", "DONE"],
            default: "WAITING"
        },
        receivedDate: {
            type: Date,
        },
        deliveryDate: {
            type: Date,
        }
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("order", Order);
