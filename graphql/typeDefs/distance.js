const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DateTime
    type Query {
        distances(origin: String!, destination: [String!]!): [Float]
    }

    input Distance {
        origin: String
        destination: String
    }
`;
