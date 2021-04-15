const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        post(id: ID!): Post!
        posts(userId: ID): [Post!]!
        postsByAdmin: [Post!]!
        postByAdmin(id: ID!): [Post!]
    }
    type Mutation {
        createPost(dataPost: dataCreatePost!): Result!
        updatePost(dataPost: dataUpdatePost!, id: ID!): Result!
        deletePost(id: ID!): Result!
    }

    type Post {
        id: ID!
        title: String!
        name: String
        uniqueBook: UniqueBook
        year: String
        numberOfReprint: Int
        publisher: String
        category: ID
        description: String!
        images: [String!]
        author: User!
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }

    input dataCreatePost {
        title: String!
        uniqueBook: ID
        description: String!
        images: [String!]
        year: String
        name: String
        numberOfReprint: Int
        publisher: String
        category: ID
        price: Float!
    }
    input dataUpdatePost {
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        name: String
        category: ID
        description: String
        title: String
        uniqueBook: ID
        price: Float
    }
`;