const { Group, Message, User } = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkSignedIn } = require('../../helper/auth');
const { pubsub, TypeSub } = require('../configs');
const { withFilter } = require('graphql-subscriptions');
const uploadFile = require('../../helper/uploadFile');
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
                    return new AuthenticationError('User have not permission');
                }
                const messageExisted = await Message.findOne({
                    _id: id,
                    'to.members': {
                        members: { $in: [req.user._id] },
                    },
                });
                if (!messageExisted) {
                    return new ApolloError('Message not found', 404);
                }

                return messageExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        messagesInGroup: async (
            parent,
            { groupId, limit = 20, page = 1 },
            { req },
            info
        ) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                const groupExisted = await Group.findOne({
                    _id: groupId,
                    members: { $in: [req.user._id] },
                });

                if (!groupExisted) {
                    return new ApolloError('Group not found', 404);
                }
                return Message.find({ to: groupId })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .skip((page - 1) * limit);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        seenMessage: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                let message = await Message.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!message) {
                    return new ApolloError('Message is deleted', 500);
                }

                message.seen = new Date();
                await message.save();
                return message;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        sendMessage: async (parent, { dataMessage }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                let group;
                if (dataMessage.user) {
                    group = new Group({
                        members: [req.user._id, dataMessage.user],
                    });
                    await group.save();
                    delete dataMessage.user;
                    dataMessage.to = group._id;
                } else {
                    group = await Group.findOne({
                        _id: dataMessage.to,
                    });
                    if (!group) {
                        return new ApolloError('Have error', 400);
                    }
                }
                const newMessage = new Message({
                    ...dataMessage,
                    from: req.user._id,
                    datetime: new Date(),
                });
                await Group.updateOne(
                    { _id: group._id },
                    { lastMassage: newMessage._id }
                );
                await newMessage.save();

                pubsub.publish(TypeSub.SEND_MESSAGE, {
                    newMessage,
                    to: group.members.filter(
                        (item) => item + '' !== req.user._id + ''
                    )[0],
                });

                return newMessage;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },

        sendMessageImage: async (parent, { dataMessageImage }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('User have not permission');
                }
                let group;
                if (dataMessageImage.user) {
                    group = new Group({
                        members: [req.user._id, dataMessageImage.user],
                    });
                    await group.save();
                } else {
                    group = await Group.findOne({
                        _id: dataMessageImage.to,
                    });
                    if (!group) {
                        return new ApolloError('Have error', 400);
                    }
                }
                if (dataMessageImage.files.length > 10) {
                    return new ApolloError('Maxfiles only 10', 500);
                }
                // const files = await Promise.all(dataMessageImage.files);
                let dataImage = [];
                const promissFiles = new Promise(async (resolve, reject) => {
                    try {
                        for (
                            let i = 0;
                            i <= dataMessageImage.files.length;
                            i++
                        ) {
                            if (i === dataMessageImage.files.length)
                                return resolve(dataImage);
                            const result = await uploadFile(
                                dataMessageImage.files[i],
                                'book'
                            );
                            dataImage.push(result.secure_url);
                        }
                    } catch (e) {
                        console.log(e);
                        reject(e);
                    }
                }).catch((err) => {
                    return new ApolloError(err.message, 500);
                });
                // const file_urls = dataMessageImage.files.map(async (file) => {
                //     const result = await uploadFile(file, 'book');
                //     console.log(result);
                //     return result.secure_url;
                // });
                // const dataImage = file_urls.reduce((a, b) => {
                //     dataImage.push(b);
                //     return a + b + '|';
                // }, '');
                // file_urls
                const data = await promissFiles;
                const newMessage = new Message({
                    to: group._id,
                    content: `đã gửi ${data.length} hình ảnh`,
                    images: data,
                    type: 'IMAGE',
                    from: req.user._id,
                    datetime: new Date(),
                });

                await Group.updateOne(
                    { _id: group._id },
                    {
                        lastMassage: newMessage._id,
                        images: [...data, ...group.images],
                    }
                );
                await newMessage.save();

                pubsub.publish(TypeSub.SEND_MESSAGE, {
                    newMessage,
                    to: group.members.filter(
                        (item) => item + '' !== req.user._id + ''
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
                    return payload.to + '' === variables.userId + '';
                }
            ),
        },
    },
};
