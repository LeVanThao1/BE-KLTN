const mongoose = require('mongoose');

const Store = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'please enter title'],
            unique: true,
        },
        address: {
            type: String,
            required: [true, 'please enter andress'],
        },
        unsignedName: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
            required: [true, 'please enter avatar'],
        },
        background: {
            type: String,
        },
        description: {
            type: String,
            required: [true, 'please enter description'],
        },
        owner: {
            type: mongoose.Types.ObjectId,
            required: [true, 'please type owner'],
            ref: 'user',
        },
        location: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2d', // create the geospatial index
        },
        verified: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('store', Store);
