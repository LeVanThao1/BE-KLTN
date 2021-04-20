const {
    Group,
    Message,
    User,
    Book,
    Post,
    CommentBook,
    CommentPost,
    NotificationBook,
    NotificationPost,
} = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkSignedIn } = require("../../helper/auth");
const { pubsub, TypeSub } = require("../configs");
const { withFilter } = require("graphql-subscriptions");
module.exports = {
    CommentBook: {
        author: async (parent, { id }, { req }, info) => {
            try {
                return await User.findOne({ _id: parent.author }).select(
                    "-password -role"
                );
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        book: async (parent, { id }, { req }, info) => {
            try {
                return await Book.findOne({ _id: parent.book });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        // reply: async (parent, { id }, { req }, info) => {
        //     try {
        //         return await CommentBook.find({ _id: { $in: parent.reply } });
        //     } catch (e) {
        //         return new ApolloError(e.message, 500);
        //     }
        // },
    },
    CommentPost: {
        author: async (parent, { id }, { req }, info) => {
            try {
                return await User.findOne({ _id: parent.author }).select(
                    "-password -role"
                );
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        post: async (parent, { id }, { req }, info) => {
            try {
                return await Post.findOne({ _id: parent.post });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        reply: async (parent, { id }, { req }, info) => {
            try {
                return await CommentPost.find({ _id: { $in: parent.reply } });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        commentOfBook: async (parent, { id }, { req }, info) => {
            try {
                const commentBookExisted = await CommentBook.findOne({
                    _id: id,
                });
                if (!commentBookExisted) {
                    return new ApolloError("Comment not found", 404);
                }

                return commentBookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        commentsOfBook: async (parent, { bookId }, { req }, info) => {
            try {
                const commentsExisted = await CommentBook.find({
                    book: bookId,
                });

                if (!commentsExisted) {
                    return new ApolloError("Comment of book not found", 404);
                }
                return commentsExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        commentsBookByAdmin: async (parent, { bookId }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                return CommentBook.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },

        commentOfPost: async (parent, { id }, { req }, info) => {
            try {
                const commentPostExisted = await CommentPost.findOne({
                    _id: id,
                });
                if (!commentPostExisted) {
                    return new ApolloError("Comment not found", 404);
                }

                return commentPostExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        commentsOfPost: async (parent, { postId }, { req }, info) => {
            try {
                const commentsExisted = await CommentPost.find({
                    post: postId,
                });

                if (!commentsExisted) {
                    return new ApolloError("Comment of post not found", 404);
                }
                return commentsExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        commentsPostByAdmin: async (parent, { bookId }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                return CommentPost.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createCommentBook: async (parent, { dataComment, bookId }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const bookExisted = await Book.findOne({
                    _id: bookId,
                    deletedAt: undefined
                }).populate({
                    path: "store",
                    populate: {
                        select: "-password -role",
                        path: "owner",
                    },
                });
                if (!bookExisted) {
                    return new ApolloError("Book not found", 400);
                }

                const newCommentBook = new CommentBook({
                    ...dataComment,
                    author: req.user,
                    book: bookId,
                });
                await newCommentBook.save();
                if (req.user._id + "" !== bookExisted.store.owner._id + "") {
                    const newNotificationBook = new NotificationBook({
                        title: `${req.user.name} has commented on your store's book`,
                        description:
                            dataComment.type === "TEXT"
                                ? dataComment.content
                                : "Commented by image",
                        to: bookExisted.store.owner,
                        seen: false,
                        commentBook: newCommentBook,
                    });
                    await newNotificationBook.save();

                    pubsub.publish(TypeSub.COMMENT_BOOK, {
                        content: newNotificationBook,
                    });
                }

                return newCommentBook;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        replyCommentBook: async (
            parent,
            { dataComment, commentId },
            { req }
        ) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const commentExisted = await CommentBook.findOne({
                    _id: commentId,
                })
                    .populate({
                        select: "-password -role",
                        path: "author",
                    })
                    .populate({
                        path: "book",
                        populate: {
                            path: "store",
                            populate: {
                                select: "-password -role",
                                path: "owner",
                            },
                        },
                    })
                    .populate({
                        path: "reply",
                        populate: {
                            select: "-password -role",
                            path: "author",
                        },
                    });
                if (!commentExisted) {
                    return new ApolloError("Comment not found", 400);
                }

                const newCommentBook = new CommentBook({
                    ...dataComment,
                    author: req.user._id,
                    book: commentExisted.book._id,
                });
                await newCommentBook.save();
                commentExisted.reply = [
                    ...commentExisted.reply,
                    newCommentBook._id,
                ];
                await commentExisted.save();
                // const filterUser = commentExisted.reply.filter(
                //     (rp) => rp.author
                // );
                const newNotificationBook = new NotificationBook({
                    title: `${req.user.name} has responded to your comment`,
                    description:
                        dataComment.type === "TEXT"
                            ? dataComment.content
                            : "Commented by image",
                    to: commentExisted.author,
                    seen: false,
                    commentBook: newCommentBook,
                });

                await newNotificationBook.save();
                pubsub.publish(TypeSub.COMMENT_BOOK, {
                    content: newNotificationBook,
                });
                return { message: "Comment success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },

        createCommentPost: async (parent, { dataComment, postId }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const postExisted = await Post.findOne({
                    _id: postId,
                    deletedAt: undefined
                }).populate({
                    select: "-password -role",
                    path: "author",
                });
                if (!postExisted) {
                    return new ApolloError("Post not found", 400);
                }
                const newCommentPost = new CommentPost({
                    ...dataComment,
                    author: req.user,
                    post: postId,
                });
                await newCommentPost.save();
                if (req.user._id + "" !== postExisted.author._id + "") {
                    const newNotificationPost = new NotificationPost({
                        title: `${req.user.name} has commented on your's post`,
                        description:
                            dataComment.type === "TEXT"
                                ? dataComment.content
                                : "Commented by image",
                        to: postExisted.author,
                        seen: false,
                        commentPost: newCommentPost,
                    });
                    await newNotificationPost.save();
                    pubsub.publish(TypeSub.COMMENT_POST, {
                        content: newNotificationPost,
                    });
                }

                return newCommentPost;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        replyCommentPost: async (
            parent,
            { dataComment, commentId },
            { req }
        ) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User have not permission");
                }
                const commentExisted = await CommentPost.findOne({
                    _id: commentId,
                })
                    .populate({
                        select: "-password -role",
                        path: "author",
                    })
                    .populate({
                        path: "post",
                        populate: {
                            select: "-password -role",
                            path: "author",
                        },
                    })
                    .populate({
                        path: "reply",
                        populate: {
                            select: "-password -role",
                            path: "author",
                        },
                    });
                if (!commentExisted) {
                    return new ApolloError("Comment not found", 400);
                }
                const newCommentPost = new CommentPost({
                    ...dataComment,
                    author: req.user._id,
                    post: commentExisted.post._id,
                });
                await newCommentPost.save();
                commentExisted.reply = [
                    ...commentExisted.reply,
                    newCommentPost._id,
                ];

                await commentExisted.save();
                // const filterUser = commentExisted.reply.filter(
                //     (rp) => rp.author
                // );
                const newNotificationPost = new NotificationPost({
                    title: `${req.user.name} has responded to your comment`,
                    description:
                        dataComment.type === "TEXT"
                            ? dataComment.content
                            : "Commented by image",
                    to: commentExisted.author,
                    seen: false,
                    commentPost: newCommentPost,
                });

                await newNotificationPost.save();
                pubsub.publish(TypeSub.COMMENT_POST, {
                    content: newNotificationPost,
                });
                return { message: "Comment success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Subscription: {
        receiveNotificationCommentBook: {
            resolve: (payload) => payload.content,
            subscribe: withFilter(
                () => pubsub.asyncIterator(TypeSub.COMMENT_BOOK),
                (payload, variables) => {
                    return (
                        payload.content.to._id + "" === variables.userId + ""
                    );
                }
            ),
        },
        receiveNotificationCommentPost: {
            resolve: (payload) => payload.content,
            subscribe: withFilter(
                () => pubsub.asyncIterator(TypeSub.COMMENT_POST),
                (payload, variables) => {
                    return (
                        payload.content.to._id + "" === variables.userId + ""
                    );
                }
            ),
        },
    },
};
