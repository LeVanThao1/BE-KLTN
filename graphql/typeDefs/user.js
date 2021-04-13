const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DateTime
    type Query {
        logout: Result!
        profile: User!
        users: [User!]!
        refreshToken: Auth!
        verify(
            phone: String
            email: String
            type: Boolean!
            otp: String!
        ): Result!
        login(
            phone: String
            password: String!
            email: String
            type: Boolean!
        ): Auth!
        user(id: ID!): User!
        forgotPassword(phone: String, email: String, type: Boolean!): Result!
        checkOTPForgot(
            phone: String
            email: String
            type: Boolean!
            otp: String!
        ): String!
        userByAdmin(id: ID!): User!
    }
    type Mutation {
        register(newUser: UserInput!, type: Boolean!): Result!
        updateUserRole(role: ROLE!, id: ID!): Result!
        updateUserInfo(userUpdate: UserUpdate!): Result!
        resetPassword(token: String!, password: String!): Result!
        changePassword(oldPassword: String!, newPassword: String!): Result!
        updateCart(dataCart: [DetailUpdate!]!): Result!
    }
    input UserInput {
        email: String
        name: String!
        phone: String
        password: String!
        interests: [ID]
    }
    input UserUpdate {
        name: String
        avatar: String
        address: String
        interests: [ID]
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
        email: String
        name: String!
        avatar: String
        phone: String
        password: String
        address: String
        role: ROLE
        otp: String
        verifed: Boolean
        expired: DateTime
        notifications: Notifications
        interests: [Category]
        createdAt: DateTime!
        updatedAt: DateTime!
        cart: [Detail!]
        isOnline: Boolean
        store: Store
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
    type Detail {
        book: Book!
        price: Float!
        amount: Int!
    }
    input DetailUpdate {
        book: ID!
        price: Float
        amount: Int!
    }
`;
