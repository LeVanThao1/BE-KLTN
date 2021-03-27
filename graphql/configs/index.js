const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const TypeSub = {
    SEND_MESSAGE: "SEND_MESSAGE",
};
module.exports = {
    pubsub,
    TypeSub,
};
