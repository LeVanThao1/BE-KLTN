const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        message(id: ID!): Message!
        messagesInGroup(groupId: ID!, limit: Int, page: Int): [Message!]!
        messagesByAdmin: [Message!]!
        seenMessage(id: ID!): Message
    }
    type Mutation {
        sendMessage(dataMessage: dataCreateMessage!): Message!
        sendMessageImage(dataMessageImage: dataMessageImage!): Message!
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
        seen: DateTime
        createdAt: DateTime
        updatedAt: DateTime
        deletedAt: DateTime
    }
    input dataCreateMessage {
        content: String!
        images: [String!]
        type: TYPE!
        to: ID
        user: ID
    }
    input dataMessageImage {
        files: [Upload!]!
        to: ID
        user: ID
    }
    enum TYPE {
        VIDEO
        TEXT
        IMAGE
    }
`;
