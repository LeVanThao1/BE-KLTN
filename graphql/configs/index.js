const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const TypeSub = {
    SEND_MESSAGE: "SEND_MESSAGE",
    NOTIFICATION: "NOTIFICATION",
    COMMENT_BOOK: "COMMENT_BOOK",
    COMMENT_POST: "COMMENT_POST",
};

const TypeNotification = {
    ORDER: "ORDER",
};

const StatusOrder = {
    CANCLE: "CANCLE",
    WAITING: "WAITING",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    DONE: "DONE",
};
const getTitleNotificationOrder = (status) => {
    if (status === StatusOrder.CANCLE) return "The order has been canceled";
    if (status === StatusOrder.CONFIRMED) return "The order has been confirmed";
    if (status === StatusOrder.PROCESSING) return "The order is shipping";
    if (status === StatusOrder.DONE)
        return "The order has been successfully delivered";
};
module.exports = {
    pubsub,
    TypeSub,
    TypeNotification,
    StatusOrder,
    getTitleNotificationOrder,
};
