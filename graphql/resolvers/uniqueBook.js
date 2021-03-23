const { UniqueBook, Category } = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
module.exports = {
    UniqueBook: {
        category: async (parent, { id }, { req }, info) => {
            try {
                return await Category.findById(parent.category);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        uniqueBook: async (parent, { id }, { req }, info) => {
            try {
                const uniqueBookExisted = await UniqueBook.findById(id);
                if (!uniqueBookExisted) {
                    return new ApolloError("Unique book not found", 404);
                }
                return uniqueBookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        uniqueBooks: async (parent, args, { req }, info) => {
            try {
                return await UniqueBook.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createUniqueBook: async (parent, { dataCreate }, { req }) => {
            try {
                const uniqueBookExisted = await UniqueBook.findOne({
                    name: dataCreate.name,
                });
                if (uniqueBookExisted) {
                    return new ApolloError("Unique book already existed", 400);
                }

                const newUniqueBook = new UniqueBook({
                    ...dataCreate,
                });
                await newUniqueBook.save();
                return { message: "Create unique book success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateUniqueBook: async (parent, { dataUpdate, id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                const uniqueBookExisted = await UniqueBook.findById(id);
                if (!uniqueBookExisted) {
                    return new AuthenticationError(
                        "Unique book not found",
                        404
                    );
                }

                for (let key in dataUpdate) {
                    if (Array.isArray(dataUpdate[key])) {
                        if (data[key].length === 0) {
                            delete dataUpdate[key];
                        }
                    } else {
                        if (!dataUpdate[key]) delete dataUpdate[key];
                    }
                }

                await UniqueBook.updateOne({ _id: id }, dataUpdate);
                return { message: "Update category success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteUniqueBook: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User have not permission");
                }
                const uniqueBookExisted = await UniqueBook.findById(id);
                if (!uniqueBookExisted) {
                    return new AuthenticationError("UniqueBook not found", 404);
                }
                await UniqueBook.deleteOne({ _id: id });
                return { message: "Delete unique book success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
