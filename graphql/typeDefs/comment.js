const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        commentOfBook(id: ID!): CommentBook!
        commentsOfBook(bookId: ID!, limit: Int, page: Int): [CommentBook!]!
        commentsBookByAdmin: [CommentBook!]!
        commentOfPost(id: ID!): CommentPost!
        commentsOfPost(postId: ID!, limit: Int, page: Int): [CommentPost!]!
        commentsPostByAdmin: [CommentPost!]!
    }
    type Mutation {
        createCommentBook(dataComment: dataComment!, bookId: ID!): CommentBook!
        replyCommentBook(dataComment: dataComment!, commentId: ID!): Result!
        createCommentPost(dataComment: dataComment!, postId: ID!): CommentPost!
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
        id: ID
        content: String
        book: Book
        author: User
        type: TYPE
        reply: [CommentBook]
        createdAt: DateTime
        updatedAt: DateTime
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
