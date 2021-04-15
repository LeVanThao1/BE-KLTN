const mongoose = require('mongoose');

const Post = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'please enter title'],
        },
        uniqueBook: {
            type: mongoose.Types.ObjectId,
            ref: 'uniqueBook',
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
            // required: [true, 'please enter name'],
        },
        year: {
            type: String,
        },
        numberOfReprint: {
            type: Number,
            min: 0,
        },
        publisher: {
            type: String,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'category',
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
        bookWanna: [{
            type: String,
            required: [true, 'please book want to exchange'],
        }],
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('post', Post);
