const { gql } = require('apollo-server-express');

module.exports = gql`
    type Query {
        home: Home!
    }
    type Home {
        bestSell: [Book!]
        books: [Book!]
        categories: [Category!]
    }
`;
