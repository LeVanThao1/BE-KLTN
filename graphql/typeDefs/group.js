const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        group(id: ID!): Group!
        groups: [Group!]!
    }
    type Mutation {
        createGroup(userId: ID!): Result!
        deleteGroup(id: ID!): Result!
    }
    type Group {
        id: ID!
        members: [User!]!
        lastMassage: Message
        messages: [Message!]
        userDeleted: [User!]
        createdAt: String!
        updatedAt: String!
        deletedAt: DateTime
    }
`;
