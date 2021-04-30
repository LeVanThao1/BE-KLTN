const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        message(id: ID!): Message!
        messagesInGroup(groupId: ID!): [Message!]!
        messagesByAdmin: [Message!]!
    }
    type Mutation {
        sendMessage(dataMessage: dataCreateMessage!): Message!
    }
    type Subscription {
        receiveMessage(userId: ID!): Message!
    }
    type Message {
        id: ID
        content: String
        images: [String!]
        datetime: DateTime
        to: Group
        from: User
        type: TYPE
        seen: Boolean
        createdAt: DateTime
        updatedAt: DateTime
        deletedAt: DateTime
    }
    input dataCreateMessage {
        content: String!
        images: [String!]
        type: TYPE!
        to: ID!
    }
    enum TYPE {
        VIDEO
        TEXT
        IMAGE
    }
`;
