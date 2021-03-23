const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        store(id: ID!): Store!
        stores: [Store!]!
        storeByStoreAndAdmin(id: ID!): Store!
        storesByAdmin: [Store!]!
    }
    type Mutation {
        createStore(dataStore: storeCreate!): Result!
        updateStore(dataStore: storeUpdate!, id: ID!): Result!
        deleteStore(id: ID!): Result!
        verifiedStore(id: ID!): Result!
    }
    type Store {
        id: ID!
        name: String!
        description: String!
        owner: User!
        books: [Book!]
        createdAt: String!
        updatedAt: String!
        deletedAt: DateTime
    }

    input storeCreate {
        name: String!
        description: String!
        owner: ID!
        avatar: String!
    }

    input storeUpdate {
        name: String
        description: String
    }
`;
