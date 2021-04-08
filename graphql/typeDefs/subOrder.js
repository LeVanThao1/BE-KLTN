const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        subOrderByUser(id: ID!): SubOrder!
    }
    type Mutation {
        updateStatusSubOrder(dataStatus: STATUS!, id: ID!): Result!
        cancleOrderByUser(id: ID!): Result!
    }
    type SubOrder {
        id: ID!
        user: User!
        detail: Detail!
        address: String!
        phone: String!
        status: STATUS!
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
