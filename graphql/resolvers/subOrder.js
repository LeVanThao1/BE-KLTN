const {
    UniqueBook,
    User,
    Order,
    SubOrder,
    Book,
    Store,
    NotificationOrder,
} = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const { ROLE } = require("../../constants");
const { checkPermission, checkSignedIn } = require("../../helper/auth");
const {
    pubsub,
    TypeNotification,
    getTitleNotificationOrder,
    TypeSub,
} = require("../configs");
module.exports = {
    SubOrder: {
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
        subOrderByUser: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("You have not permission");
                }
                const subOrderExisted = await SubOrder.findOne({
                    _id: id,
                    user: req.user._id,
                    deletedAt: undefined,
                });
                if (!subOrderExisted) {
                    return new ApolloError("Order not found", 404);
                }
                return subOrderExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        subOrdersByUser: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("You have not permission");
                }
                return await SubOrder.find({
                    user: req.user._id,
                    deletedAt: undefined,
                });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        updateStatusSubOrder: async (
            parent,
            { dataStatus, id },
            { req },
            info
        ) => {
            try {
                if (!(await checkPermission(req, [ROLE.STORE]))) {
                    return new AuthenticationError("User have not permission");
                }
                const subOrderExisted = await SubOrder.findOne({
                    _id: id,
                    deletedAt: undefined,
                })
                    .populate({
                        path: "detail.book",
                    })
                    .populate({
                        select: "-password -role",
                        path: "user",
                    });

                if (!subOrderExisted) {
                    return new ApolloError("Order not found", 404);
                }
                if (subOrderExisted.status === "CANCLE") {
                    return new ApolloError(
                        "The order was canceled before ",
                        400
                    );
                }
                const findStore = await Store.findOne({ owner: req.user._id });
                if (
                    subOrderExisted.detail.book.store + "" !==
                    findStore._id + ""
                ) {
                    return new ApolloError(
                        "You are not store of this order",
                        400
                    );
                }
                if (dataStatus === "CANCLE") {
                    await increaseAmount(subOrderExisted.detail);
                }
                subOrderExisted.status = dataStatus;
                const newNotificationOrder = new NotificationOrder({
                    title: getTitleNotificationOrder(dataStatus),
                    order: subOrderExisted,
                    to: subOrderExisted.user,
                    seen: false,
                    description: getTitleNotificationOrder(dataStatus),
                });
                await newNotificationOrder.save();
                pubsub.publish(TypeSub.NOTIFICATION, {
                    content: newNotificationOrder,
                });
                subOrderExisted.save();
                return { message: "Update status success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        cancleOrderByUser: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("You have not permission");
                }
                const subOrderExisted = await SubOrder.findOne({
                    _id: id,
                    user: req.user._id,
                }).populate({
                    path: "detail.book",
                    populate: {
                        select: "-avatar",
                        path: "store book",
                        populate: {
                            select: "-password -role",
                            path: "owner",
                        },
                    },
                });
                if (!subOrderExisted) {
                    return new ApolloError("Order not found", 404);
                }
                if (subOrderExisted.status === "CANCLE") {
                    return new ApolloError(
                        "The order was canceled before ",
                        400
                    );
                }
                if (
                    subOrderExisted.status !== "WAITING" &&
                    subOrderExisted.status !== "CANCLE"
                ) {
                    return new ApolloError(
                        "Your order has been confirmed, please contact the store to cancel the order",
                        400
                    );
                }
                await increaseAmount([subOrderExisted.detail]);
                subOrderExisted.status = "CANCLE";
                const newNotificationOrder = new NotificationOrder({
                    title: getTitleNotificationOrder("CANCLE"),
                    order: subOrderExisted,
                    to: subOrderExisted.detail.book.store.owner,
                    seen: false,
                    description: getTitleNotificationOrder("CANCLE"),
                });
                await newNotificationOrder.save();
                pubsub.publish(TypeSub.NOTIFICATION, {
                    content: newNotificationOrder,
                });
                subOrderExisted.save();
                return { message: "Cancle status success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
const increaseAmount = async (subOrder) => {
    try {
        let query = subOrder.map((item) => {
            return {
                updateOne: {
                    filter: {
                        _id: item.book,
                    },
                    update: {
                        $inc: {
                            amount: +item.amount,
                            sold: -item.amount,
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
