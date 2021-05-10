const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        group(id: ID!): Group!
        groups(limit: Int, page: Int): [Group!]!
        getImages(id: ID!): [String!]!
    }
    type Mutation {
        createGroup(userId: ID!): Result!
        deleteGroup(id: ID!): Result!
    }
    type Group {
        id: ID
        members: [User!]
        lastMassage: Message
        messages: [Message!]
        images: [String]
        userDeleted: [User!]
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
`;
