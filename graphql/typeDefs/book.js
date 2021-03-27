const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        book(id: ID!, store: ID): Book!
        books(store: ID): [Book!]!
        bookByAdmin(id: ID!): Book!
        booksByAdmin: [Book!]!
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
        deletedAt: DateTime
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
