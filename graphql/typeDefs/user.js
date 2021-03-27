const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        logout: Result!
        profile: User!
        users: [User!]!
        refreshToken: Auth!
        verify(phone: String!, otp: String!): Result!
        login(phone: String!, password: String!): Auth!
        user(id: ID!): User!
        forgotPassword(phone: String!): Result!
        checkOTPForgot(phone: String!, otp: String): String!
        userByAdmin(id: ID!): User!
    }
    type Mutation {
        register(newUser: UserInput!): Result!
        updateUserRole(role: ROLE!, id: ID!): Result!
        updateUserInfo(userUpdate: UserUpdate!): Result!
        resetPassword(token: String!, password: String!): Result!
        changePassword(oldPassword: String!, newPassword: String!): Result!
    }
    input UserInput {
        email: String!
        name: String!
        phone: String!
        password: String!
    }
    input UserUpdate {
        name: String
        avatar: String
        address: String
    }
    enum ROLE {
        ADMIN
        MEMBER
        STORE
    }
    type Result {
        message: String!
    }
    type User {
        id: ID!
        email: String!
        name: String!
        avatar: String
        phone: String!
        password: String!
        address: String
        role: ROLE!
        OPT: String
        verifed: Boolean
        createdAt: String!
        updatedAt: String!
        isOnline: Boolean
        deletedAt: DateTime
    }
    input OTP {
        otp: String!
    }
    type Auth {
        user: User!
        token: String!
        refreshToken: String!
    }
`;
