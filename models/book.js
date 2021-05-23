const mongoose = require('mongoose');
const NotificationBookAdmin = require('./notificationBookAdmin');
const UniqueBook = require('./uniqueBook');
const { pubsub, TypeSub } = require('../graphql/configs');
const {
    compare,
    changeAlias,
    stringToObjectSequence,
} = require('../helper/compareString');

const Book = mongoose.Schema(
    {
        book: {
            type: mongoose.Types.ObjectId,
            ref: 'uniqueBook',
            default: null,
        },
        store: {
            type: mongoose.Types.ObjectId,
            required: [true, 'please enter store'],
            ref: 'store',
        },
        amount: {
            type: Number,
            min: 0,
            required: [true, 'please enter amount'],
        },
        author: {
            type: String,
        },
        price: {
            type: Number,
            min: 0,
            required: [true, 'please enter price'],
        },
        sold: {
            type: Number,
            min: 0,
            default: 0,
        },
        deletedAt: {
            type: Date,
        },
        name: {
            type: String,
            default: null,
        },
        unsignedName: {
            type: String,
            default: null,
        },
        images: [
            {
                type: String,
            },
        ],
        year: {
            type: String,
            default: null,
        },
        numberOfReprint: {
            type: Number,
            min: 0,
            default: null,
        },
        publisher: {
            type: String,
            default: null,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'category',
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const BookModel = mongoose.model('book', Book);
BookModel.watch().on('change', async ({ fullDocument, operationType }) => {
    if (operationType == 'insert' && !fullDocument.book) {
        let dataNotify = {
            data: {
                name: fullDocument.name,
                images: fullDocument.images,
                year: fullDocument.year,
                numberOfReprint: fullDocument.numberOfReprint,
                publisher: fullDocument.publisher,
                author: fullDocument.author,
                category: fullDocument.category,
                description: fullDocument.description,
                unsignedName: fullDocument.unsignedName,
                author: fullDocument.author,
            },
            seen: false,
        };
        const uniqueBook = await UniqueBook.find({
            category: fullDocument.category,
        }).lean();

        if (uniqueBook?.length === 0) {
            dataNotify.title = 'New book';
            dataNotify.status = 'ADD';
            dataNotify.description =
                'Currently this book is not available in the database. do you want to add a new one';
            return;
        }
        const dataMap = uniqueBook
            .map((book, i) => {
                const unsignedBook = changeAlias(
                    `${book.name} ${book.description} ${book.year} ${book.author} ${book.publisher} ${book.numberOfReprint}`
                );
                const unsignedDocument = changeAlias(
                    `${fullDocument.name} ${fullDocument.description} ${fullDocument.year} ${fullDocument.author} ${fullDocument.publisher} ${fullDocument.numberOfReprint}`
                );
                return {
                    id: book._id,
                    percent: compare(
                        stringToObjectSequence(unsignedDocument),
                        stringToObjectSequence(unsignedBook)
                    ),
                };
            })
            .filter((book) => {
                console.log(book);
                return book.percent >= 60;
            })
            .sort((a, b) => b - a)[0];

        if (!dataMap || dataMap?.length === 0) {
            dataNotify.title = 'New book';
            dataNotify.status = 'ADD';
            dataNotify.description =
                'Currently this book is not available in the database. do you want to add a new one';
        } else {
            dataNotify.title = 'New book';
            dataNotify.status = 'UPDATE';
            dataNotify.description =
                'Currently this book is available in the database. do you want to update it';
            dataNotify.uniqueBook = dataMap.id;
        }
        const newNotificationAdmin = new NotificationBookAdmin(dataNotify);
        await newNotificationAdmin.save();
        pubsub.publish(TypeSub.CREATEBOOK, {
            content: newNotificationAdmin,
        });
    }
});
module.exports = BookModel;
