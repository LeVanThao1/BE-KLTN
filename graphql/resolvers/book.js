const { UniqueBook, Store, Book } = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
module.exports = {
    Book: {
        book: async (parent, { id }, { req }, info) => {
            try {
                return await UniqueBook.findById(parent.book);
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
    },
    Mutation: {
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
                    $and: [{ book: dataBook.book }, { store: store._id }],
                    deletedAt: undefined,
                });
                if (bookExisted) {
                    return new ApolloError("Book already existed in shop", 400);
                }

                const newBook = new Book({
                    ...dataBook,
                    store: store._id,
                });
                await newBook.save();
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
