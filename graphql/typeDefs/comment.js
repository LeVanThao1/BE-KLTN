const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        commentOfBook(id: ID!): CommentBook!
        commentsOfBook(bookId: ID!): [CommentBook!]!
        commentsBookByAdmin: [CommentBook!]!
        commentOfPost(id: ID!): CommentPost!
        commentsOfPost(postId: ID!): [CommentPost!]!
        commentsPostByAdmin: [CommentPost!]!
    }
    type Mutation {
        createCommentBook(dataComment: dataComment!, bookId: ID!): Result!
        replyCommentBook(dataComment: dataComment!, commentId: ID!): Result!
        createCommentPost(dataComment: dataComment!, postId: ID!): Result!
        replyCommentPost(dataComment: dataComment!, commentId: ID!): Result!
    }
    type Subscription {
        receiveNotificationCommentBook(userId: ID!): NotificationBook!
        receiveNotificationCommentPost(userId: ID!): NotificationPost!
    }
    type CommentPost {
        id: ID!
        content: String!
        post: Post!
        author: User!
        type: TYPE!
        reply: [CommentPost]
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    type CommentBook {
        id: ID!
        content: String!
        book: Book!
        author: User!
        type: TYPE!
        reply: [CommentBook]
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    input dataComment {
        content: String!
        type: TYPE!
    }

    enum TYPE {
        VIDEO
        TEXT
        IMAGE
    }
`;
