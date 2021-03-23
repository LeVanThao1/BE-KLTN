const { Category } = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission } = require("../../helper/auth");
module.exports = {
    Query: {
        category: async (parent, { id }, { req }, info) => {
            try {
                const categoryExisted = await Category.findById(id);
                if (!categoryExisted) {
                    return new ApolloError("Category not found", 404);
                }
                return categoryExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        categories: async (parent, args, { req }, info) => {
            try {
                return await Category.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createCategory: async (parent, { name }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User not authenticated");
                }
                const categoryExisted = await Category.findOne({
                    name,
                });
                if (categoryExisted) {
                    return new ApolloError(
                        "Name category already existed",
                        400
                    );
                }

                const newCategory = new Category({
                    name,
                });
                await newCategory.save();
                return { message: "Create category success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateCategory: async (parent, { id, name }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User not authenticated");
                }
                const caterogyExisted = await Category.findById(id);
                if (!caterogyExisted) {
                    return new AuthenticationError("Category not found", 404);
                }

                caterogyExisted.name = name;
                await caterogyExisted.save();
                return { message: "Update category success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteCategory: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User not authenticated");
                }
                const caterogyExisted = await Category.findById(id);
                if (!caterogyExisted) {
                    return new AuthenticationError("Category not found", 404);
                }
                await Category.deleteOne({ _id: id });
                return { message: "Delete category success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
