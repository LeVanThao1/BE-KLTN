const mongoose = require('mongoose');

const Post = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'please enter title'],
        },
        unsignedTitle: {
            type: String,
            default: null,
        },
        unsignedName: {
            type: String,
            default: null,
        },
        unsignedDescription: {
            type: String,
            default: null,
        },
        images: [
            {
                type: String,
            },
        ],
        description: {
            type: String,
            required: [true, 'please enter description'],
        },
        name: {
            type: String,
            default: null,
            required: [true, 'please enter name'],
        },
        year: {
            type: String,
            default: null,
            required: [true, 'please enter year'],
        },
        numberOfReprint: {
            type: Number,
            min: 0,
            default: null,
            required: [true, 'please enter year'],
        },
        publisher: {
            type: String,
            default: null,
            required: [true, 'please enter year'],
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'category',
            default: null,
            required: [true, 'please enter category'],
        },
        price: {
            type: Number,
            min: 0,
            required: [true, 'please enter price'],
        },
        author: {
            type: mongoose.Types.ObjectId,
            required: [true, 'please author'],
            ref: 'user',
        },
        bookWanna: [
            {
                type: String,
                // required: [true, 'please book want to exchange'],
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

module.exports = mongoose.model('post', Post);
