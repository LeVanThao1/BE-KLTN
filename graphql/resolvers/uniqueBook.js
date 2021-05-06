const { UniqueBook, Category } = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkPermission } = require('../../helper/auth');
const {
    compare,
    stringToObjectSequence,
    changeAlias,
} = require('../../helper/compareString');
const { toUnsigned } = require('../../helper/common');
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
        getRecomment: async (parent, { dataUniqueBook }, { req }, info) => {
            try {
                const {
                    name,
                    description,
                    year,
                    numberOfReprint,
                    publisher,
                    category,
                } = dataUniqueBook;
                const strA =
                    name +
                    ',' +
                    description +
                    ',' +
                    year +
                    ',' +
                    numberOfReprint +
                    ',' +
                    publisher +
                    ',' +
                    category;
                const uniqueBook = await UniqueBook.find({
                    deletedAt: undefined,
                });
                const result = uniqueBook.filter((dt) => {
                    const {
                        name,
                        description,
                        year,
                        numberOfReprint,
                        publisher,
                        category,
                    } = dt;
                    const strB =
                        name +
                        ',' +
                        description +
                        ',' +
                        year +
                        ',' +
                        numberOfReprint +
                        ',' +
                        publisher +
                        ',' +
                        category;
                    const percent = compare(
                        stringToObjectSequence(changeAlias(strA)),
                        stringToObjectSequence(changeAlias(strB))
                    );
                    if (percent > 50) {
                        dt.percent = percent;
                        return true;
                    }
                    return false;
                });
                return result.sort((a, b) => a.percent - b.percent);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        getRecommentByName: async (
            parent,
            { name, type = 'unsignedName' },
            { req },
            info
        ) => {
            try {
                let search = name;
                if (type === 'unsignedName') search = toUnsigned(name);
                const uniqueBook = await UniqueBook.find({
                    [type]: { $regex: search, $options: 'i' },
                    deletedAt: undefined,
                });
                return uniqueBook;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        uniqueBook: async (parent, { id }, { req }, info) => {
            try {
                const uniqueBookExisted = await UniqueBook.findOne({
                    _id: id,
                    deletedAt: undefined,
                });
                if (!uniqueBookExisted) {
                    return new ApolloError('Unique book not found', 404);
                }
                return uniqueBookExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        uniqueBooks: async (parent, args, { req }, info) => {
            try {
                return await UniqueBook.find({ deletedAt: undefined });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createUniqueBook: async (parent, { dataCreate }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                const uniqueBookExisted = await UniqueBook.findOne({
                    name: dataCreate.name,
                });
                if (uniqueBookExisted) {
                    return new ApolloError('Unique book already existed', 400);
                }
                dataCreate.unsignedName = toUnsigned(dataCreate.name);
                const newUniqueBook = new UniqueBook({
                    ...dataCreate,
                });
                await newUniqueBook.save();
                return { message: 'Create unique book success' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateUniqueBook: async (parent, { dataUpdate, id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                const uniqueBookExisted = await UniqueBook.findById(id);
                if (!uniqueBookExisted) {
                    return new AuthenticationError(
                        'Unique book not found',
                        404
                    );
                }

                if (dataUpdate.name) {
                    dataUpdate.unsignedName = toUnsigned(dataUpdate.name);
                }
                for (let key in dataUpdate) {
                    if (Array.isArray(dataUpdate[key])) {
                        if (dataUpdate[key].length === 0) {
                            delete dataUpdate[key];
                        }
                    } else {
                        if (!dataUpdate[key]) delete dataUpdate[key];
                    }
                }

                await UniqueBook.updateOne({ _id: id }, dataUpdate);
                return { message: 'Update category success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteUniqueBook: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                const uniqueBookExisted = await UniqueBook.findById(id);
                if (!uniqueBookExisted) {
                    return new AuthenticationError('UniqueBook not found', 404);
                }
                await UniqueBook.deleteOne({ _id: id });
                return { message: 'Delete unique book success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
