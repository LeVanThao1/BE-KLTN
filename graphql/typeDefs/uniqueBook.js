const { gql } = require("apollo-server-express");

module.exports = gql`
    type Query {
        uniqueBook(id: ID!): UniqueBook!
        uniqueBooks: [UniqueBook!]!
    }
    type Mutation {
        createUniqueBook(dataCreate: UniqueBookCreate!): Result!
        updateUniqueBook(dataUpdate: UniqueBookUpdate!, id: ID!): Result!
        deleteUniqueBook(id: ID!): Result!
    }
    type UniqueBook {
        id: ID!
        name: String!
        images: [String!]!
        year: String!
        numberOfReprint: Int!
        publisher: String!
        category: Category!
        description: String!
        createdAt: String!
        updatedAt: String!
    }
    input UniqueBookCreate {
        name: String!
        images: [String!]!
        year: String!
        numberOfReprint: Int!
        publisher: String!
        category: ID!
        description: String!
    }
    input UniqueBookUpdate {
        name: String
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        category: ID
        description: String
    }
`;
