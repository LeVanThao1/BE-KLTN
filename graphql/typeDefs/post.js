const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        post(id: ID!): Post!
        posts(userId: ID): [Post!]!
        postsByAdmin: [Post!]!
        postByAdmin(id: ID!): [Post!]
        searchPost(description: String!): [Post!]!
    }
    type Mutation {
        createPost(dataPost: dataCreatePost!): Post!
        updatePost(dataPost: dataUpdatePost!, id: ID!): Result!
        deletePost(id: ID!): Result!
    }

    type Post {
        id: ID
        title: String
        name: String
        year: String
        numberOfReprint: Int
        publisher: String
        category: Category
        description: String
        price: Float
        images: [String!]
        author: User
        comment: [CommentPost]
        bookWanna: [String]
        createdAt: DateTime
        updatedAt: DateTime
        deletedAt: DateTime
    }

    input dataCreatePost {
        title: String!
        description: String!
        images: [String!]
        year: String
        name: String
        numberOfReprint: Int
        publisher: String
        category: ID
        price: Float!
        bookWanna: [String!]!
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
        bookWanna: [String!]
        price: Float
    }
`;
