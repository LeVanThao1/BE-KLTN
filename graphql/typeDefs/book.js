const { gql } = require("apollo-server-express");

module.exports = gql`
    type Query {
        book(id: ID!): Book!
        books: [Book!]!
        bookFromStore(id: ID!, store: ID!): Book!
        booksFromStore(store: ID!): [Book!]!
    }
    type Mutation {
        createBook(dataBook: BookCreate!): Result!
        updateBook(dataBook: BookUpdate!, id: ID!): Result!
        deleteBook(id: ID!): Result!
    }
    type Book {
        id: ID!
        book: UniqueBook!
        store: Store!
        amount: Float!
        price: Float!
        createdAt: String!
        updatedAt: String!
    }
    input BookCreate {
        book: ID!
        amount: Float!
        price: Float!
    }
    input BookUpdate {
        amount: Float
        price: Float
    }
`;
