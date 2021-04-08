const { Evalute, User, Store } = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
module.exports = {
    Evalute: {
        store: async (parent, { id }, { req }, info) => {
            try {
                return Store.findOne({ _id: parent.store });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        author: async (parent, { id }, { req }, info) => {
            try {
                return User.findOne({ _id: parent.author });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        evalute: async (parent, { id }, { req }, info) => {
            try {
                const evaluteExisted = await Evalute.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!evaluteExisted) {
                    return new ApolloError("Evalute not found", 404);
                }
                return evaluteExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        evalutes: async (parent, args, { req }, info) => {
            try {
                return await Evalute.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        evalutesOfStore: async (parent, { storeId }, { req }, info) => {
            try {
                return await Evalute.find({ store: storeId });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createEvaluteStore: async (parent, { dataEvalute }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const evaluteExisted = await Evalute.findOne({
                    author: req.user._id,
                    store: dataEvalute.store,
                    deletedAt: undefined,
                });
                if (evaluteExisted) {
                    evaluteExisted.content = dataEvalute.content;
                    evaluteExisted.start = dataEvalute.start;
                    await evaluteExisted.save();
                    return { message: "Update evalute store success" };
                }

                const newEvalute = new Evalute({
                    ...dataEvalute,
                    author: req.user._id,
                });
                await newEvalute.save();
                return { message: "Evalute store success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateEvalute: async (parent, { id, dataEvalute }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const evaluteExisted = await Evalute.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!evaluteExisted) {
                    return new AuthenticationError("Evalute not found", 404);
                }
                evaluteExisted.content = dataEvalute.content;
                evaluteExisted.start = dataEvalute.start;
                await evaluteExisted.save();
                return { message: "Update evalute success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteEvaluteByStore: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError("User not authenticated");
                }
                const evaluteExisted = await Evalute.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!evaluteExisted) {
                    return new AuthenticationError("Evalute not found", 404);
                }
                await Evalute.updateOne({ _id: id }, { deletedAt: new Date() });
                return { message: "Delete category success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
