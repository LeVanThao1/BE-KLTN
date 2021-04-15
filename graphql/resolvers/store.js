const { Store, User, Book } = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
const { toUnsigned } = require("../../helper/common");
module.exports = {
    Store: {
        owner: async (parent, { id }, { req }, info) => {
            try {
                return await User.findById(parent.owner).select("-password");
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        books: async (parent, { id }, { req }, info) => {
            try {
                return await Book.find({ store: parent._id });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        store: async (parent, { id }, { req }, info) => {
            try {
                const storeExisted = await Store.findOne({
                    _id: id,
                    verified: true,
                    deletedAt: undefined,
                });
                if (!storeExisted) {
                    return new ApolloError("Store not found", 404);
                }
                return storeExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        storeByStoreAndAdmin: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE, ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                let query = {
                    _id: id,
                };
                if (req.user.role === ROLE.STORE) {
                    query = {
                        ...query,
                        owner: req.user._id,
                        deletedAt: undefined,
                    };
                }
                const storeExisted = await Store.findOne(query);
                if (!storeExisted) {
                    return new ApolloError("Store not found", 404);
                }
                return storeExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        stores: async (parent, args, { req }, info) => {
            try {
                return await Store.find({
                    verified: true,
                    deletedAt: undefined,
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        storesByAdmin: async (parent, args, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                return await Store.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createStore: async (parent, { dataStore }, { req }) => {
            try {
                const storeExisted = await Store.findOne({
                    name: dataStore.name,
                    deletedAt: undefined,
                });
                if (storeExisted) {
                    return new ApolloError("Name store already existed", 400);
                }

                const newStore = new Store({
                    ...dataStore,
                    unsignedName: toUnsigned(dataStore.name)
                });
                await newStore.save();
                return { message: "Create store success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateStore: async (parent, { dataStore, id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError("User have not permission");
                }
                const storeExisted = await Store.findOne({
                    _id: id,
                    owner: req.user._id,
                    verified: true,
                    deletedAt: undefined,
                });
                if (!storeExisted) {
                    return new AuthenticationError("Store not found", 404);
                }

                for (let key in dataStore) {
                    if (Array.isArray(dataStore[key])) {
                        if (data[key].length === 0) {
                            delete dataStore[key];
                        }
                    } else {
                        if (!dataStore[key]) delete dataStore[key];
                    }
                }

                await Store.updateOne({ _id: id }, dataStore);
                return { message: "Update store success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteStore: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN, ROLE.STORE]))) {
                    return new AuthenticationError("User have not permission");
                }
                let query = {
                    _id: id,
                };
                if (req.user.role === ROLE.STORE) {
                    query = {
                        ...query,
                        owner: req.user._id,
                        deletedAt: undefined,
                    };
                }
                const storeExisted = await Store.findOne(query);
                if (!storeExisted) {
                    return new AuthenticationError("Store not found", 404);
                }
                await Store.deleteOne({ _id: id });
                return { message: "Delete store success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        verifiedStore: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                const storeExisted = await Store.findOne({
                    _id: id,
                    verified: false,
                    deletedAt: undefined,
                });
                if (!storeExisted) {
                    return new AuthenticationError("Store not found", 404);
                }
                storeExisted.verified = true;
                await storeExisted.save();
                return { message: "Verified store success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
