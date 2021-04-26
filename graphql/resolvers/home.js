const {
    UniqueBook,
    Store,
    Book,
    NotificationBookAdmin,
    Category,
    CommentBook,
} = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkPermission } = require('../../helper/auth');
const { pubsub, TypeSub } = require('../configs');
const { toUnsigned } = require('../../helper/common');
module.exports = {
    Query: {
        home: async (parent, args, { req }, info) => {
            try {
                const bestSell = await Book.find({ sold: { $gt: 0 } })
                    .sort({
                        sold: -1,
                    })
                    .limit(20);
                const books = await Book.find().limit(20);
                const categories = await Category.find();
                return { bestSell, books, categories };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
