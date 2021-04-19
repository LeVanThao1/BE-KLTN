const {
    UniqueBook,
    User,
    Order,
    SubOrder,
    Book,
    NotificationOrder,
} = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission, checkSignedIn } = require("../../helper/auth");
const { pubsub, TypeSub, TypeNotification } = require("../configs");
const { withFilter } = require("graphql-subscriptions");
module.exports = {
    Order: {
        subOrder: async (parent, { id }, { req }, info) => {
            try {
                return await SubOrder.find({ _id: { $in: parent.subOrder } });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        user: async (parent, { id }, { req }, info) => {
            try {
                return await User.findById(parent.user).select(
                    "-password -role"
                );
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        orderOfUser: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("You have not permission");
                }
                const orderExisted = await Order.findOne({
                    _id: id,
                    user: req.user._id,
                    deletedAt: undefined,
                });
                if (!orderExisted) {
                    return new ApolloError("Order not found", 404);
                }
                return orderExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        createOrder: async (parent, { dataOrder }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("You have not permission");
                }
                const getProducts = await checkOrder(dataOrder.subOrder);
                if (getProducts.length <= 0) {
                    return new ApolloError(
                        "The number of ordered book is greater than the quantity of the stock"
                    );
                }
                await decreaseAmount(dataOrder.subOrder);
                let data = new Array();
                let total = 0;

                const promissSubOrder = new Promise(async (resolve, reject) => {
                    try {
                        for (let i = 0; i <= dataOrder.subOrder.length; i++) {
                            if (i === dataOrder.subOrder.length)
                                return resolve(data);
                            total +=
                                dataOrder.subOrder[i].price *
                                dataOrder.subOrder[i].amount;
                            const newSubOrder = new SubOrder({
                                user: req.user._id,
                                detail: dataOrder.subOrder[i],
                                address: dataOrder.address,
                                phone: dataOrder.phone,
                                name: dataOrder.name
                            });
                            await newSubOrder.save();
                            const newNotification = new NotificationOrder({
                                title:
                                    "You have an order awaiting confirmation",
                                order: newSubOrder,
                                to: getProducts[i].store.owner,
                                seen: false,
                                description:
                                    "You have an order awaiting confirmation",
                            });
                            await newNotification.save();
                            pubsub.publish(TypeSub.NOTIFICATION, {
                                content: newNotification,
                                type: TypeNotification.ORDER,
                            });
                            data.push(newSubOrder._id);
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
                const subOrder = await promissSubOrder;
                const newOrder = new Order({
                    ...dataOrder,
                    subOrder: subOrder,
                    user: req.user._id,
                    total,
                });
                await newOrder.save();
                return { message: "Create order success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Subscription: {
        receiveNotificationOrder: {
            resolve: (payload) => payload.content,
            subscribe: withFilter(
                () => pubsub.asyncIterator(TypeSub.NOTIFICATION),
                (payload, variables) => {
                    return (
                        payload.content.to._id + "" === variables.userId + ""
                    );
                }
            ),
        },
    },
};

const checkOrder = async (subOrder) => {
    try {
        const products = [...subOrder];
        const query = products.map((pd) => ({
            _id: pd.book,
        }));

        const getProducts = await Book.find({ $or: query })
            .sort({
                _id: 1,
            })
            .populate({
                select: "owner",
                path: "store",
                populate: {
                    select: "-password",
                    path: "owner",
                },
            });
        for (let i = 0; i < products.length; i++) {
            const find = products.find((el) => el.book +"" === getProducts[i]._id + "")
            if(!find) {
                return []
            }
            if (find.price !== getProducts[i].price) {
                return [];
            }
            if (find.amount > getProducts[i].amount) {
                return [];
            }
        }
        return getProducts;
    } catch (e) {
        return new ApolloError(e.message, 500);
    }
};

const decreaseAmount = async (subOrder) => {
    try {
        let query = subOrder.map((item) => {
            return {
                updateOne: {
                    filter: {
                        _id: item.book,
                    },
                    update: {
                        $inc: {
                            amount: -item.amount,
                            sold: +item.amount,
                        },
                    },
                },
            };
        });
        Book.bulkWrite(query, {}, (e, products) => {
            if (e) {
                return new ApolloError(e.message, 500);
            }
        });
    } catch (e) {
        return new ApolloError(e.message, 500);
    }
};
