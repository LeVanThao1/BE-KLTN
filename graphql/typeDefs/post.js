const { gql } = require("apollo-server-express");

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
        uniqueBook: UniqueBook!
        description: String!
        images: [String!]
        author: User!
        createdAt: String!
        updatedAt: String!
        deletedAt: DateTime
    }
    input dataCreatePost {
        title: String!
        uniqueBook: ID!
        description: String!
        images: [String!]
    }
    input dataUpdatePost {
        title: String
        uniqueBook: ID
        description: String
        images: [String!]
    }
`;
