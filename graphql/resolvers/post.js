const {
    UniqueBook,
    User,
    Post,
    Category,
    CommentPost,
} = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkPermission, checkSignedIn } = require('../../helper/auth');
const { toUnsigned } = require('../../helper/common');
module.exports = {
    Post: {
        uniqueBook: async (parent, { id }, { req }, info) => {
            try {
                return parent.uniqueBook
                    ? await UniqueBook.findById(parent.uniqueBook)
                    : {};
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        author: async (parent, { id }, { req }, info) => {
            try {
                return await User.findById(parent.author).select(
                    '-password -role'
                );
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
        comment: async (parent, { id }, { req }, info) => {
            try {
                return await CommentPost.find({ post: parent.id });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        searchPost: async (parent, { description }, { req }, info) => {
            try {
                const unsignedDescription = toUnsigned(description);
                return (postExisted = await Post.find({
                    unsignedDescription: {
                        $regex: unsignedDescription,
                        $options: 'i',
                    },
                }));
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        post: async (parent, { id }, { req }, info) => {
            try {
                const postExisted = await Post.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!postExisted) {
                    return new ApolloError('Post not found', 404);
                }
                return postExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        posts: async (parent, { userId }, { req }, info) => {
            let query = {
                deletedAt: undefined,
            };
            if (userId) {
                query.author = userId;
            }
            try {
                return await Post.find(query);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        postsByAdmin: async (parent, { userId }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                return await Post.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        postByAdmin: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                const postExisted = await Post.findOne({
                    _id: id,
                });
                if (!postExisted) {
                    return new ApolloError('Post not found', 404);
                }
                return postExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createPost: async (parent, { dataPost }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('You have not permission');
                }
                let dataNewPost = {
                    title: dataPost.title,
                    unsignedTitle: toUnsigned(dataPost.title),
                    price: dataPost.price,
                    description: dataPost.description,
                    unsignedDescription: toUnsigned(dataPost.description),
                    images: dataPost.images,
                    bookWanna: dataPost.bookWanna,
                };

                dataNewPost.name = dataPost.name;
                dataNewPost.unsignedName = toUnsigned(dataPost.name);
                dataNewPost.year = dataPost.year;
                dataNewPost.numberOfReprint = dataPost.numberOfReprint;
                dataNewPost.publisher = dataPost.publisher;
                dataNewPost.category = dataPost.category;

                const newPost = new Post({
                    ...dataNewPost,
                    author: req.user._id,
                });

                await newPost.save();
                return newPost;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updatePost: async (parent, { dataPost, id }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('You have not permission');
                }
                const post = await Post.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (post.author + '' !== req.user._id + '') {
                    return new ApolloError('You have not permission', 404);
                }
                if (!post) {
                    return new ApolloError('Post not found', 404);
                }
                if (dataPost.name) {
                    dataPost.unsignedName = toUnsigned(dataPost.name);
                }
                if (dataPost.description) {
                    dataPost.unsignedDescription = toUnsigned(
                        dataPost.description
                    );
                }
                if (dataPost.title) {
                    dataPost.unsignedTitle = toUnsigned(dataPost.title);
                }
                for (let key in dataPost) {
                    if (Array.isArray(dataPost[key])) {
                        if (dataPost[key].length === 0) {
                            delete dataPost[key];
                        }
                    } else {
                        if (!dataPost[key]) delete dataPost[key];
                    }
                }

                await Post.updateOne(
                    {
                        _id: id,
                        author: req.user._id,
                        deletedAt: undefined,
                    },
                    dataPost
                );
                return { message: 'Update post success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deletePost: async (parent, { id }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('You have not permission');
                }
                const post = await Post.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!post) {
                    return new ApolloError('Post not found', 404);
                }
                if (post.author + '' !== req.user._id + '') {
                    return new ApolloError('You have not permission', 404);
                }
                await Post.updateOne(
                    { _id: id, author: req.user._id, deletedAt: undefined },
                    { deletedAt: new Date() }
                );

                return { message: 'Delete post success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
