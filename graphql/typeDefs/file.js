const { gql } = require('apollo-server-express');

module.exports = gql`
    type Photo {
        id: ID!
        url: String!
        name: String!
        asset_id: String!
        public_id: String!
    }
    type Query {
        photo(id: ID!): Photo
    }

    type Mutation {
        uploadSingleFile(file: Upload!): Photo!
        uploadMultiFile(files: [Upload!]!): [Photo!]!
    }
`;
