const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        orderOfUser(id: ID!): Order
    }
    type Mutation {
        createOrder(dataOrder: OrderCreate): Result!
    }
    type Subscription {
        receiveNotificationOrder(userId: ID!): NotificationOrder!
    }
    type NotificationOrder {
        title: String!
        description: String!
        to: User!
        order: SubOrder!
    }
    type Order {
        id: ID!
        user: User!
        subOrder: [SubOrder!]!
        name: String!
        address: String!
        total: Float!
        phone: String!
        note: String
        statusPayment: STATUSPAYMENT!
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    input OrderCreate {
        name: String!
        address: String!
        phone: String!
        note: String
        subOrder: [DetailUpdate!]!
        typePayment: TYPEPAYMENT!
    }
`;
