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
