const mongoose = require("mongoose");

const User = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "please enter name"],
        },
        avatar: {
            type: String,
            default:
                "https://res.cloudinary.com/thaovan/image/upload/v1606099416/Dinosuar_shop/avatar/male.jpg",
        },
        email: {
            type: String,
            trim: true,
            // required: [true, "please enter email"],
            unique: true,
        },
        phone: {
            type: String,
            length: 10,
            // required: [true, "please enter phone"],
            unique: true,
        },
        password: {
            type: String,
            min: 8,
            max: 30,
            required: [true, "please enter password"],
        },
        address: {
            type: String,
            min: 10,
            max: 100,
        },
        role: {
            type: String,
            enum: ["ADMIN", "MEMBER", "STORE"],
            default: "MEMBER",
        },
        otp: {
            type: String,
            length: 6,
        },
        verifed: {
            type: Boolean,
            default: false,
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        expired: {
            type: Date,
        },
        cart: [
            {
                book: {
                    type: mongoose.Types.ObjectId,
                    required: [true, "please enter book"],
                    ref: "book",
                },
                amount: {
                    type: Number,
                    required: [true, "please enter amount"],
                },
                price: {
                    type: Number,
                    required: [true, "please enter price"],
                },
            },
        ],
        interests: [
            {
                type: mongoose.Types.ObjectId,
                ref: "category",
            },
        ],
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("user", User);
