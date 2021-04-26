const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        notifications: Notifications!
        notificationsOrder: [NotificationOrder!]!
        notificationsBook: [NotificationBook!]!
        notificationsPost: [NotificationPost!]!
        notificationOfOrder(id: ID!): NotificationOrder!
        notificationOfBook(id: ID!): NotificationBook!
        notificationOfPost(id: ID!): NotificationPost!
        notificationBookOfAdmin(id: ID!): NotificationBookAdmin!
    }
    type Mutation {
        seenNotificationBook(id: ID!): Result!
        seenNotificationPost(id: ID!): Result!
        seenNotificationOrder(id: ID!): Result!
        seenNotificationBookAdmin(id: ID!): Result!
    }
    type Subscription {
        receiveNotificationBookAdmin(userId: ID!): NotificationBookAdmin!
    }
    type DataBookAdmin {
        name: String!
        images: [String!]!
        year: String!
        numberOfReprint: Int!
        publisher: String!
        category: ID!
        author: String
        description: String!
    }
    enum STATUSBOOKADMIN {
        ADD
        UPDATE
    }
    type NotificationBookAdmin {
        id: ID!
        title: String!
        description: String!
        data: DataBookAdmin!
        seen: Boolean
        status: STATUSBOOKADMIN!
        uniqueBook: ID
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    type NotificationOrder {
        id: ID!
        title: String!
        description: String!
        to: User!
        order: SubOrder!
        seen: Boolean!
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    type NotificationBook {
        id: ID!
        title: String!
        description: String!
        to: User!
        commentBook: CommentBook!
        seen: Boolean
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    type Post {
        id: ID!
        title: String!
        uniqueBook: UniqueBook!
        description: String!
        images: [String!]
        author: User!
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    type NotificationPost {
        id: ID!
        title: String!
        description: String!
        to: User!
        commentPost: CommentPost!
        seen: Boolean
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    type Notifications {
        order: [NotificationOrder!]!
        book: [NotificationBook!]!
        post: [NotificationPost!]!
    }
`;
