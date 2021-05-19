const { Store, User, Book } = require('../../models');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ROLE } = require('../../constants');
const { checkPermission, checkSignedIn } = require('../../helper/auth');
const {
    toUnsigned,
    getDistanceFromLatLonInKm,
} = require('../../helper/common');
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',
    // Optional depending on the providers
    apiKey: process.env.API_KEY_MAP, // for Mapquest, OpenCage, Google Premier
    formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);
module.exports = {
    Store: {
        owner: async (parent, { id }, { req }, info) => {
            try {
                return await User.findById(parent.owner).select('-password');
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        books: async (parent, { id }, { req }, info) => {
            try {
                return await Book.find({ store: parent._id });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        store: async (parent, { id }, { req }, info) => {
            try {
                const storeExisted = await Store.findOne({
                    _id: id,
                    verified: true,
                    deletedAt: undefined,
                });
                if (!storeExisted) {
                    return new ApolloError('Store not found', 404);
                }
                return storeExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        storeByStoreAndAdmin: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE, ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                let query = {
                    _id: id,
                };
                if (req.user.role === ROLE.STORE) {
                    query = {
                        ...query,
                        owner: req.user._id,
                        deletedAt: undefined,
                    };
                }
                const storeExisted = await Store.findOne(query);
                if (!storeExisted) {
                    return new ApolloError('Store not found', 404);
                }
                return storeExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        stores: async (parent, args, { req }, info) => {
            try {
                return await Store.find({
                    verified: true,
                    deletedAt: undefined,
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        storesByAdmin: async (parent, args, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                return await Store.find();
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        locationsStores: async (
            parent,
            { distance = 50, lng = 0, lat = 0, limit = 50 },
            { req },
            info
        ) => {
            try {
                console.log(lng, lat);
                const maxDistance = distance / 111.12;
                let query = {
                    location: {
                        $near: [lat, lng],
                        $maxDistance: maxDistance,
                    },
                };
                const data = await Store.find(query).limit(limit);
                console.log(data);
                return data.map((dt) => ({
                    store: dt,
                    distance: getDistanceFromLatLonInKm(
                        ...dt.location,
                        lat,
                        lng
                    ).toFixed(1),
                }));
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createStore: async (parent, { dataStore }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError('You have not permission');
                }
                const storeExisted = await Store.findOne({
                    name: dataStore.name,
                    deletedAt: undefined,
                });
                if (storeExisted) {
                    return new ApolloError('Name store already existed', 400);
                }
                if (dataStore.address) {
                    const [{ latitude, longitude }] = await geocoder.geocode(
                        address
                    );
                    dataStore.location = [latitude, longitude];
                }
                const newStore = new Store({
                    ...dataStore,
                    unsignedName: toUnsigned(dataStore.name),
                });
                await User.updateOne(
                    { _id: req.user._id },
                    { role: ROLE.STORE }
                );
                await newStore.save();
                return { message: 'Create store success' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateStore: async (parent, { dataStore, id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError('User have not permission');
                }
                const storeExisted = await Store.findOne({
                    _id: id,
                    owner: req.user._id,
                    verified: true,
                    deletedAt: undefined,
                });
                if (!storeExisted) {
                    return new AuthenticationError('Store not found', 404);
                }
                if (dataStore.address) {
                    const [{ latitude, longitude }] = await geocoder.geocode(
                        dataStore.address
                    );
                    dataStore.location = [latitude, longitude];
                }
                for (let key in dataStore) {
                    if (Array.isArray(dataStore[key])) {
                        if (dataStore[key].length === 0) {
                            delete dataStore[key];
                        }
                    } else {
                        if (!dataStore[key]) delete dataStore[key];
                    }
                }

                await Store.updateOne({ _id: id }, dataStore);
                return { message: 'Update store success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        deleteStore: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN, ROLE.STORE]))) {
                    return new AuthenticationError('User have not permission');
                }
                let query = {
                    _id: id,
                };
                if (req.user.role === ROLE.STORE) {
                    query = {
                        ...query,
                        owner: req.user._id,
                        deletedAt: undefined,
                    };
                }
                const storeExisted = await Store.findOne(query);
                if (!storeExisted) {
                    return new AuthenticationError('Store not found', 404);
                }
                await Store.deleteOne({ _id: id });
                return { message: 'Delete store success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        verifiedStore: async (parent, { id }, { req }) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError('User have not permission');
                }
                const storeExisted = await Store.findOne({
                    _id: id,
                    verified: false,
                    deletedAt: undefined,
                });
                if (!storeExisted) {
                    return new AuthenticationError('Store not found', 404);
                }
                storeExisted.verified = true;
                await storeExisted.save();
                return { message: 'Verified store success!' };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
