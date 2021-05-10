const mongoose = require('mongoose');

const Group = mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Types.ObjectId,
                required: [true, 'please enter member'],
                ref: 'user',
            },
        ],
        images: [
            {
                type: String,
            },
        ],
        messages: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'message',
            },
        ],
        lastMassage: {
            type: mongoose.Types.ObjectId,
            // required: [true, "please enter message"],
            ref: 'message',
        },
        deletedAt: {
            type: Date,
        },
        userDeleted: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'user',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('group', Group);
