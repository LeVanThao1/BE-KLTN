const {
    UniqueBook,
    Store,
    Book,
    NotificationBookAdmin,
    Category,
    CommentBook,
} = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkPermission } = require('../../helper/auth');
const { pubsub, TypeSub } = require('../configs');
const { toUnsigned } = require('../../helper/common');
module.exports = {
    Book: {
        book: async (parent, { id }, { req }, info) => {
            try {
                return parent.book && (await UniqueBook.findById(parent.book));
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        store: async (parent, { id }, { req }, info) => {
            try {
                return await Store.findById(parent.store);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        category: async (parent, { id }, { req }, info) => {
            try {
                return (
                    parent.category &&
                    (await Category.findById(parent.category))
                );
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        comment: async (parent, { id }, { req }, info) => {
            try {
                return await CommentBook.find({ book: parent.id })
                    .sort({ createdAt: -1 })
                    .limit(8);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        book: async (parent, { id, store }, { req }, info) => {
            try {
                let query = {
                    _id: id,
                    deletedAt: undefined,
                };
                if (store) {
                    query.store = store;
                }
                const bookExisted = await Book.findOne(query);
                if (!bookExisted) {
                    return new ApolloError('Book not found', 404);
                }
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        books: async (
            parent,
            { store, limit = 20, page = 1 },
            { req },
            info
        ) => {
            try {
                let query = {
                    deletedAt: undefined,
                };
                if (store) {
                    query.store = store;
                }
                return await Book.find(query)
                    .limit(limit)
                    .skip((page - 1) * limit)
                    .sort({ createdAt: -1 });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        bookSell: async (parent, {}, { req }, info) => {
            try {
                return await Book.find({
                    sold: { $gt: 0 },
                    deletedAt: undefined,
                })
                    .sort({
                        sold: -1,
                    })
                    .limit(10);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        bookByAdmin: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                const bookExisted = await Book.findOne({ _id: id });
                if (!bookExisted) {
                    return new ApolloError('Book not found', 404);
                }
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        bookByName: async (
            parent,
            { name, category, limit = 20, page = 1 },
            { req },
            info
        ) => {
            try {
                const unsignedName = toUnsigned(name);
                let query = {
                    deletedAt: undefined,
                };
                const uniqueBook = await UniqueBook.find({
                    unsignedName: { $regex: unsignedName, $options: 'i' },
                }).select('_id');
                const idUnique = uniqueBook.map((t) => t._id);
                if (category) {
                    query.category = category;
                }
                const bookExisted = await Book.find({
                    $or: [
                        {
                            unsignedName: {
                                $regex: unsignedName,
                                $options: 'i',
                            },
                        },
                        { book: { $in: idUnique } },
                    ],
                    ...query,
                })
                    .populate({
                        path: 'book',
                    })
                    .limit(limit)
                    .skip((page - 1) * limit);
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        bookByInterest: async (parent, {}, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                const uniqueBook = await UniqueBook.find({
                    category: { $in: req.user.interests },
                    deletedAt: undefined,
                });
                const idUnique = uniqueBook.map((dt) => dt._id);
                return await Book.find({
                    $or: [
                        { book: { $in: idUnique } },
                        { category: { $in: req.user.interests } },
                    ],
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        booksByAdmin: async (parent, args, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                return await Book.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        booksByCategory: async (
            parent,
            { id, limit = 20, page = 1 },
            { req },
            info
        ) => {
            try {
                const uniqueBook = await UniqueBook.find({ category: id });
                const idUnique = uniqueBook.map((dt) => dt._id);
                return await Book.find({
                    $or: [
                        { book: { $in: idUnique } },
                        { category: { $in: id } },
                    ],
                    deletedAt: undefined,
                })
                    .limit(limit)
                    .skip((page - 1) * limit);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createBookOther: async (
            parent,
            { dataUniqueBook, amount, price },
            { req }
        ) => {
            try {
                return { message: 'Create book success' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        createBook: async (parent, { dataBook }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError('User have not permission');
                }
                const store = await Store.findOne({ owner: req.user._id });
                if (!store) {
                    return new ApolloError('You have not store', 400);
                }
                let query = {
                    $or: [{ name: dataBook.name }],
                };
                if (dataBook.book) {
                    query['$or'] = [...query['$or'], { book: dataBook.book }];
                }
                const bookExisted = await Book.findOne({
                    ...query,
                    store: store._id,
                    deletedAt: undefined,
                });
                if (bookExisted) {
                    return new ApolloError('Book already existed in shop', 400);
                }
                let dataNewBook = {};
                if (dataBook.book) dataNewBook.book = dataBook.book;
                else {
                    dataNewBook.name = dataBook.name;
                    dataNewBook.images = dataBook.images;
                    dataNewBook.year = dataBook.year;
                    dataNewBook.numberOfReprint = dataBook.numberOfReprint;
                    dataNewBook.publisher = dataBook.publisher;
                    dataNewBook.category = dataBook.category;
                    dataNewBook.description = dataBook.description;
                    dataNewBook.unsignedName = toUnsigned(dataBook.name);
                    dataNewBook.author = dataBook.author;
                }
                const newBook = new Book({
                    ...dataNewBook,
                    store: store._id,
                    amount: dataBook.amount,
                    price: dataBook.price,
                });
                await newBook.save();

                return newBook;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateBook: async (parent, { dataBook, id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError('User have not permission');
                }
                const store = await Store.findOne({
                    owner: req.user._id,
                    deletedAt: undefined,
                });
                if (!store) {
                    return new ApolloError('You have not store', 400);
                }
                const bookExisted = await Book.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!bookExisted) {
                    return new AuthenticationError('Book not found', 404);
                }

                for (let key in dataBook) {
                    if (Array.isArray(dataBook[key])) {
                        if (dataBook[key].length === 0) {
                            delete dataBook[key];
                        }
                    } else {
                        if (!dataBook[key]) delete dataBook[key];
                    }
                }

                await Book.updateOne({ _id: id }, dataBook);
                return { message: 'Update book success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteBook: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError('User have not permission');
                }
                const store = await Store.findOne({
                    owner: req.user._id,
                    deletedAt: undefined,
                });
                if (!store) {
                    return new ApolloError('You have not permission', 400);
                }
                const bookExisted = await Book.findById(id);
                if (!bookExisted) {
                    return new ApolloError('Book not found', 404);
                }
                await Book.updateOne(
                    { _id: id, deletedAt: undefined },
                    { deletedAt: new Date() }
                );
                return { message: 'Delete book success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
