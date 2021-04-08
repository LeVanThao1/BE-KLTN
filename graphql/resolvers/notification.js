const {
    Category,
    NotificationOrder,
    NotificationBook,
    NotificationPost,
    User,
    SubOrder,
    Book,
    CommentPost,
    CommentBook,
} = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkSignedIn } = require("../../helper/auth");
module.exports = {
    NotificationOrder: {
        to: async (parent, { id }, { req }, info) => {
            try {
                return {
                    user: await User.findOne({ _id: parent.to }).select(
                        "-password -role"
                    ),
                    seen: parent.seen,
                };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        order: async (parent, { id }, { req }, info) => {
            try {
                return await SubOrder.findOne({ _id: parent.order });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    NotificationBook: {
        to: async (parent, { id }, { req }, info) => {
            try {
                return await User.findOne({ _id: parent.to }).select(
                    "-password -role"
                );
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        commentBook: async (parent, { id }, { req }, info) => {
            try {
                return await CommentBook.findOne({ _id: parent.commentBook });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    NotificationPost: {
        to: async (parent, { id }, { req }, info) => {
            try {
                return await User.findOne({ _id: parent.to }).select(
                    "-password -role"
                );
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        commentPost: async (parent, { id }, { req }, info) => {
            try {
                return await CommentPost.findOne({ _id: parent.commentPost });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        notifications: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                return [
                    await NotificationOrder.find({ to: req.user._id }),
                    await NotificationBook.find({
                        to: req.user._id,
                    }),
                    await NotificationPost.find({
                        to: req.user._id,
                    }),
                ];
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notificationsOrder: async (parent, args, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                return await NotificationOrder.find({ to: req.user._id });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notificationsBook: async (parent, args, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                return await NotificationBook.find({
                    to: req.user._id,
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notificationsPost: async (parent, args, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                return await NotificationPost.find({
                    to: req.user._id,
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notificationOfOrder: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const notifiExisted = await NotificationOrder.findOne({
                    to: req.user._id,
                    _id: id,
                });
                if (!notifiExisted) {
                    return new ApolloError("Notifi not found", 404);
                }
                return notifiExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notificationOfBook: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const notifiExisted = await NotificationBook.findOne({
                    to: req.user._id,
                    _id: id,
                });
                if (!notifiExisted) {
                    return new ApolloError("Notifi not found", 404);
                }
                return notifiExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notificationOfPost: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const notifiExisted = await NotificationPost.findOne({
                    to: req.user._id,
                    _id: id,
                });
                if (!notifiExisted) {
                    return new ApolloError("Notifi not found", 404);
                }
                return notifiExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        seenNotificationBook: async (parent, { id }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const notifiExisted = await NotificationBook.findOne({
                    to: req.user._id,
                    _id: id,
                });
                if (notifiExisted) {
                    return new ApolloError("Notifi not found", 404);
                }
                (notifiExisted.seen = true), await notifiExisted.save();
                return { message: "Success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        seenNotificationPost: async (parent, { id, name }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const notifiExisted = await NotificationOrder.findOne({
                    to: req.user._id,
                    _id: id,
                });
                if (notifiExisted) {
                    return new ApolloError("Notifi not found", 404);
                }
                (notifiExisted.seen = true), await notifiExisted.save();
                return { message: "Success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        seenNotificationOrder: async (parent, { id }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const notifiExisted = await NotificationPost.findOne({
                    to: req.user._id,
                    _id: id,
                });
                if (notifiExisted) {
                    return new ApolloError("Notifi not found", 404);
                }
                (notifiExisted.seen = true), await notifiExisted.save();
                return { message: "Success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
