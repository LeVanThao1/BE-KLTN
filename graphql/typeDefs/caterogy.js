const { gql } = require("apollo-server-express");

module.exports = gql`
    type Query {
        category(id: ID!): Category!
        categories: [Category!]!
    }
    type Mutation {
        createCategory(name: String!): Result!
        updateCategory(id: String!, name: String): Result!
        deleteCategory(id: ID!): Result!
    }
    type Category {
        id: ID!
        name: String!
        createdAt: String!
        updatedAt: String!
    }
`;
