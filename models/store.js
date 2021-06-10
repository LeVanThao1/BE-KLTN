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
            default:
                'https://res.cloudinary.com/thaovan/image/upload/v1622269815/Dino_Store/avatar/stroe_efp1ck.jpg',
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
            index: '2d', // create the geospatial index,
            default: [10.767815, 106.645915],
        },
        verified: {
            type: Boolean,
            default: true,
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
