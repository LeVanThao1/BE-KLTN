const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        evalute(id: ID!): Evalute!
        evalutes: [Evalute!]!
        evalutesOfStore(storeId: ID!): [Evalute!]!
    }
    type Mutation {
        createEvaluteStore(dataEvalute: DataEvalute!): Result!
        updateEvalute(id: ID!, dataEvalute: DataEvalute!): Result!
        deleteEvaluteByStore(id: ID!): Result!
    }
    type Evalute {
        id: ID
        content: String
        store: Store
        start: Int
        author: User
        createdAt: DateTime
        updatedAt: DateTime
        deletedAt: DateTime
    }
    input DataEvalute {
        content: String!
        store: ID!
        start: Int!
    }
`;
