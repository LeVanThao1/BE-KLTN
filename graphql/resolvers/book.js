const {
    UniqueBook,
    Store,
    Book,
    NotificationBookAdmin,
    Category,
} = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
const { pubsub, TypeSub } = require("../configs");
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
                    return new ApolloError("Book not found", 404);
                }
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        books: async (parent, { store }, { req }, info) => {
            try {
                let query = {
                    deletedAt: undefined,
                };
                if (store) {
                    query.store = store;
                }
                return await Book.find(query);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        bookByAdmin: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                const bookExisted = await Book.findOne({ _id: id });
                if (!bookExisted) {
                    return new ApolloError("Book not found", 404);
                }
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        booksByAdmin: async (parent, args, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                return await Book.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        booksByCategory: async (parent, { id }, { req }, info) => {
            try {
                const uniqueBook = await UniqueBook.find({ category: id });
                const idUnique = uniqueBook.map((dt) => dt._id);
                return await Book.find({
                    $or: [
                        { book: { $in: idUnique } },
                        { category: { $in: idUnique } },
                    ],
                });
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
                // if (!(await checkPermission(req, [ROLE.STORE]))) {
                //     return new AuthenticationError("User have not permission");
                // }
                // const store = await Store.findOne({ owner: req.user._id });
                // if (!store) {
                //     return new ApolloError("You have not store", 400);
                // }
                // const bookExisted = await Book.findOne({
                //     $and: [{ book: dataBook.book }, { store: store._id }],
                //     deletedAt: undefined,
                // });

                // if (bookExisted) {
                //     return new ApolloError("Book already existed in shop", 400);
                // }

                // const newBook = new Book({
                //     ...dataBook,
                //     store: store._id,
                // });
                // await newBook.save();
                return { message: "Create book success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        createBook: async (parent, { dataBook }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError("User have not permission");
                }
                const store = await Store.findOne({ owner: req.user._id });
                if (!store) {
                    return new ApolloError("You have not store", 400);
                }
                const bookExisted = await Book.findOne({
                    $or: [{ book: dataBook.book }, { name: dataBook.name }],
                    store: store._id,
                    deletedAt: undefined,
                });
                if (bookExisted) {
                    return new ApolloError("Book already existed in shop", 400);
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
                }
                const newBook = new Book({
                    ...dataNewBook,
                    store: store._id,
                    amount: dataBook.amount,
                    price: dataBook.price,
                });
                await newBook.save();

                if (!dataBook.book) {
                    let dataNotify = {
                        data: dataNewBook,
                        seen: false,
                    };
                    const uniqueBook = await UniqueBook.findOne({
                        name: dataNewBook.name,
                    }).populate({
                        path: "category",
                    });
                    if (!uniqueBook) {
                        dataNotify.title = "New book";
                        dataNotify.status = "ADD";
                        dataNotify.description =
                            "Currently this book is not available in the database. do you want to add a new one";
                    } else {
                        dataNotify.title = "New book";
                        dataNotify.status = "UPDATE";
                        dataNotify.description =
                            "Currently this book is available in the database. do you want to update it";
                        dataNotify.uniqueBook = uniqueBook._id;
                    }
                    const newNotificationAdmin = new NotificationBookAdmin(
                        dataNotify
                    );
                    await newNotificationAdmin.save();
                    pubsub.publish(TypeSub.CREATEBOOK, {
                        content: newNotificationAdmin,
                    });
                }
                return { message: "Create book success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateBook: async (parent, { dataBook, id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError("User have not permission");
                }
                const store = await Store.findOne({
                    owner: req.user._id,
                    deletedAt: undefined,
                });
                if (!store) {
                    return new ApolloError("You have not store", 400);
                }
                const bookExisted = await Book.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!bookExisted) {
                    return new AuthenticationError("Book not found", 404);
                }

                for (let key in dataBook) {
                    if (Array.isArray(dataBook[key])) {
                        if (data[key].length === 0) {
                            delete dataBook[key];
                        }
                    } else {
                        if (!dataBook[key]) delete dataBook[key];
                    }
                }

                await Book.updateOne({ _id: id }, dataBook);
                return { message: "Update book success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteBook: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError("User have not permission");
                }
                const store = await Store.findOne({
                    owner: req.user._id,
                    deletedAt: undefined,
                });
                if (!store) {
                    return new ApolloError("You have not permission", 400);
                }
                const bookExisted = await Book.findById(id);
                if (!bookExisted) {
                    return new ApolloError("Book not found", 404);
                }
                await Book.updateOne(
                    { _id: id, deletedAt: undefined },
                    { deletedAt: new Date() }
                );
                return { message: "Delete book success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
