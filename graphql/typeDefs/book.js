const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        book(id: ID!, store: ID): Book!
        books(store: ID, limit: Int, page: Int): [Book!]!
        bookByAdmin(id: ID!): Book!
        booksByAdmin: [Book!]!
        booksByCategory(id: ID!, limit: Int, page: Int): [Book!]!
        bookByName(name: String!): [Book!]!
        bookByInterest(name: String!): [Book!]!
        bookSell: [Book!]!
    }
    type Mutation {
        createBook(dataBook: BookCreate!): Book!
        updateBook(dataBook: BookUpdate!, id: ID!): Result!
        deleteBook(id: ID!): Result!
        createBookOther(
            dataUniqueBook: UniqueBookCreate
            amount: Float!
            price: Float!
        ): Result!
    }
    type Book {
        id: ID!
        book: UniqueBook
        name: String
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        category: Category
        description: String
        store: Store!
        amount: Float!
        price: Float!
        sold: Float!
        author: String!
        comment: [CommentBook]
        createdAt: DateTime!
        updatedAt: DateTime!
        deletedAt: DateTime
    }
    input BookCreate {
        book: ID
        amount: Float!
        price: Float!
        name: String
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        category: ID
        description: String
        author: String
    }
    input BookUpdate {
        amount: Float
        price: Float
        name: String
        images: [String!]
        year: String
        numberOfReprint: Int
        publisher: String
        category: ID
        author: String
        description: String
    }
`;
