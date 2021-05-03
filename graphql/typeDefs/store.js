const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        store(id: ID!): Store!
        stores: [Store!]!
        storeByStoreAndAdmin(id: ID!): Store!
        storesByAdmin: [Store!]!
        locationsStores(
            distance: Int
            lng: Float
            lat: Float
            limit: Int
        ): [LocationStore!]
    }
    type Mutation {
        createStore(dataStore: storeCreate!): Result!
        updateStore(dataStore: storeUpdate!, id: ID!): Result!
        deleteStore(id: ID!): Result!
        verifiedStore(id: ID!): Result!
    }
    type Store {
        id: ID
        name: String
        description: String
        owner: User
        background: String
        avatar: String
        address: String
        books: [Book!]
        createdAt: DateTime
        updatedAt: DateTime
        deletedAt: DateTime
    }
    type LocationStore {
        store: Store
        distance: Float
    }
    input storeCreate {
        name: String!
        description: String!
        background: String
        owner: ID!
        address: String
        avatar: String
    }

    input storeUpdate {
        name: String
        description: String
        background: String
        avatar: String
    }
`;
