const { Group, Message, User } = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkSignedIn } = require('../../helper/auth');
module.exports = {
    Group: {
        lastMassage: async (parent, args, { req }, info) => {
            return await Message.findOne({ _id: parent.lastMassage });
        },
        members: async (parent, args, { req }, info) => {
            return await User.find({ _id: { $in: parent.members } });
        },
    },
    Query: {
        group: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                const groupExisred = await Group.findOne({
                    _id: id,
                    members: { $in: [req.user._id] },
                });
                if (!groupExisred) {
                    return new ApolloError('Group not found', 404);
                }
                return groupExisred;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        groups: async (parent, { limit = 20, page = 1 }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                return await Group.find({
                    members: { $in: [req.user._id] },
                })
                    .sort({ updatedAt: -1 })
                    .limit(20)
                    .skip((page - 1) * limit);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        getImages: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                const groupExisred = await Group.findOne({
                    _id: id,
                    members: { $in: [req.user._id] },
                });
                if (!groupExisred) {
                    return new ApolloError('Group not found', 404);
                }
                return groupExisred.images;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createGroup: async (parent, { userId }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                const groupExisted = await Group.findOne({
                    members: { $all: [req.user._id, userId] },
                });
                if (groupExisted) {
                    return new ApolloError('Group already existed', 400);
                }

                const newGroup = new Group({
                    members: [userId, req.user._id],
                });
                await newGroup.save();
                return { message: 'Create group success' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteGroup: async (parent, { id }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                const groupExisted = await Group.findOne({
                    _id: id,
                    members: { $in: [req.user._id] },
                    userDeleted: { $nin: [req.user._id] },
                });
                if (!groupExisted) {
                    return new AuthenticationError('Group not found', 404);
                }
                await Group.updateOne(
                    { _id: id },
                    { userDeleted: [...groupExisted.userDeleted, req.user._id] }
                );
                return { message: 'Delete group success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
