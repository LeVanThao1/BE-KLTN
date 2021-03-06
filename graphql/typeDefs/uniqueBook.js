const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        uniqueBook(id: ID!): UniqueBook!
        uniqueBooks: [UniqueBook!]!
        getRecomment(dataUniqueBook: UniqueBookCreate!): [UniqueBook!]!
        getRecommentByName(name: String!, type: String): [UniqueBook!]!
    }
    type Mutation {
        createUniqueBook(dataCreate: UniqueBookCreate!): Result!
        updateUniqueBook(dataUpdate: UniqueBookUpdate!, id: ID!): Result!
        deleteUniqueBook(id: ID!): Result!
    }
    type UniqueBook {
        id: ID
        name: String
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        author: String
        category: Category
        description: String
        createdAt: DateTime
        updatedAt: DateTime
        deletedAt: DateTime
        percent: Int
    }
    input UniqueBookCreate {
        name: String!
        images: [String!]!
        year: String!
        numberOfReprint: Int!
        publisher: String!
        category: ID!
        author: String!
        description: String!
    }
    input UniqueBookUpdate {
        name: String
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        category: ID
        author: String
        description: String
    }
`;
