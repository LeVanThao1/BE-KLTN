const UniqueBook = require("../../models/uniqueBook");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
const Store = require("../../models/store");
const Book = require("../../models/book");
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
        book: async (parent, { id }, { req }, info) => {
            try {
                const bookExisted = await Book.findById(id);
                if (!bookExisted) {
                    return new ApolloError("Book not found", 404);
                }
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        bookFromStore: async (parent, { id, store }, { req }, info) => {
            try {
                const bookExisted = await Book.findOne({ _id: id, store });
                if (!bookExisted) {
                    return new ApolloError("Book not found", 404);
                }
                return bookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        books: async (parent, args, { req }, info) => {
            try {
                return await Book.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        booksFromStore: async (parent, { store }, { req }, info) => {
            try {
                return await Book.find({ store });
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
                const store = await Store.findOne({ owner: req.user._id });
                if (!store) {
                    return new ApolloError("You have not store", 400);
                }
                const bookExisted = await Book.findById(id);
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
                const store = await Store.findOne({ owner: req.user._id });
                if (!store) {
                    return new ApolloError("You have not permission", 400);
                }
                const bookExisted = await Book.findById(id);
                if (!bookExisted) {
                    return new ApolloError("Book not found", 404);
                }
                await Store.deleteOne({ _id: id });
                return { message: "Delete book success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
