const { Group, Message, User } = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkSignedIn } = require("../../helper/auth");
const { pubsub, TypeSub } = require("../configs");
const { withFilter } = require("graphql-subscriptions");
module.exports = {
    Message: {
        from: async (parent, { id }, { req }, info) => {
            try {
                return await User.findOne({ _id: parent.from });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        to: async (parent, { id }, { req }, info) => {
            try {
                return await Group.findOne({ _id: parent.to });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        message: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const messageExisted = await Message.findOne({
                    _id: id,
                    "to.members": {
                        members: { $in: [req.user._id] },
                    },
                });
                if (!messageExisted) {
                    return new ApolloError("Message not found", 404);
                }

                return messageExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        messagesInGroup: async (parent, { groupId }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const groupExisted = await Group.findOne({
                    _id: groupId,
                    members: { $in: [req.user._id] },
                });

                if (!groupExisted) {
                    return new ApolloError("Group not found", 404);
                }
                return Message.find({ to: groupId }).populate({
                    path: "to",
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        sendMessage: async (parent, { dataMessage }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const groupExisted = await Group.findOne({
                    _id: dataMessage.to,
                });
                if (!groupExisted) {
                    return new ApolloError("Have error", 400);
                }

                const newMessage = new Message({
                    ...dataMessage,
                    from: req.user._id,
                    datetime: new Date(),
                });
                await Group.updateOne(
                    { _id: dataMessage.to },
                    { lastMassage: newMessage._id }
                );
                await newMessage.save();

                pubsub.publish(TypeSub.SEND_MESSAGE, {
                    newMessage,
                    to: groupExisted.members.filter(
                        (item) => item !== req.user._id
                    )[0],
                });

                return newMessage;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Subscription: {
        receiveMessage: {
            resolve: (payload) => payload.newMessage,
            subscribe: withFilter(
                () => pubsub.asyncIterator(TypeSub.SEND_MESSAGE),
                (payload, variables) => {
                    return payload.to + "" === variables.userId + "";
                }
            ),
        },
    },
};
