const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        subOrderByUser(id: ID!): SubOrder!
        subOrdersByUser: [SubOrder!]!
        subOrdersByStore: [SubOrder!]!
        subOrderByStore(id: ID!): SubOrder
    }
    type Mutation {
        updateStatusSubOrder(dataStatus: STATUS!, id: ID!): Result!
        cancleOrderByUser(id: ID!): Result!
    }
    enum TYPEPAYMENT {
        ONLINE
        AFTERRECEIVED
    }

    enum STATUSPAYMENT {
        UNPAID
        PAID
    }

    type SubOrder {
        id: ID!
        user: User!
        detail: Detail!
        address: String!
        phone: String!
        status: STATUS!
        note: String
        store: Store!
        statusPayment: STATUSPAYMENT!
        dateOfPayment: DateTime
        typePayment: TYPEPAYMENT!
        receivedDate: DateTime
        deliveryDate: DateTime
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    enum STATUS {
        CANCLE
        WAITING
        CONFIRMED
        PROCESSING
        DONE
    }
`;
