const {
    User,
    Book,
    Store,
    Category,
    NotificationOrder,
    NotificationBook,
    NotificationPost,
} = require("../../models");
const { ApolloError, AuthenticationError } = require("apollo-server-express");
const accountSid = process.env.TWILIOID_ACCOUNT_SID;
const authToken = process.env.TWILIOID_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const serviceId = process.env.TWILIOID_SERVICE_SID;
const bcrypt = require("bcrypt");
const {
    issueToken,
    checkSignedIn,
    refreshToken,
    checkPermission,
    createToken,
    checkResetPassword,
} = require("../../helper/auth");
const { ROLE } = require("../../constants");
const sendEmail = require("../../helper/mailer");
const moment = require("moment");
module.exports = {
    Detail: {
        book: async (parent, args, { req }, info) => {
            try {
                return await Book.findOne({ _id: parent.book });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    User: {
        store: async (parent, args, { req }, info) => {
            try {
                return await Store.findOne({ owner: parent.id });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        interests: async (parent, args, { req }, info) => {
            try {
                return await Category.findOne({ _id: parent.interests });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        notifications: async (parent, args, { req }, info) => {
            try {
                console.log(req.user);
                const a = {
                    order: await NotificationOrder.find({ to: parent.id }),
                    book: await NotificationBook.find({
                        to: parent.id,
                    }),
                    post: await NotificationPost.find({
                        to: parent.id,
                    }),
                };
                return a;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Query: {
        profile: async (parent, args, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User not authenticated");
                }
                return req.user;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        refreshToken: async (parent, args, { req }, info) => {
            try {
                if (!(await refreshToken(req))) {
                    return new AuthenticationError("User not authenticated");
                }
                return {
                    user: req.user,
                    ...req.tokens,
                };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        users: async (parent, args, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User not authenticated");
                }
                return await User.find().select("-password");
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        userByAdmin: async (parent, { id }, { req }, info) => {
            try {
                if (!(await checkPermission(req, [ROLE.ADMIN]))) {
                    return new AuthenticationError("User not found");
                }
                return await User.findOne({ _id: id }).select("-password");
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        user: async (parent, { id }, { req }, info) => {
            try {
                const userExisted = await User.findOne({
                    _id: id,
                    verifed: true,
                }).select("-password");
                if (!userExisted) {
                    return new ApolloError("User not found", 400);
                }
                return userExisted;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        verify: async (parent, { phone, otp, email, type }) => {
            try {
                let query = { verifed: false };
                if (type) query.phone = phone;
                else query.email = email;
                const user = await User.findOne(query);
                if (!user) {
                    return new ApolloError("User not found", "404");
                }
                if (otp !== user.otp) {
                    return new ApolloError("OTP is invalid", "400");
                }
                if (moment(user.expired) < new Date()) {
                    return new ApolloError("OTP is expired", "400");
                }
                // await client.verify
                //     .services(serviceId)
                //     .verificationChecks.create({
                //         to: "+84" + user.phone.slice(1),
                //         code: otp,
                //     })
                //     .then((verified) => console.log(verified))
                //     .catch((e) => {
                //         throw new ApolloError("OTP incorrect", 400);
                //     });
                await User.updateOne(query, {
                    verifed: true,
                    expired: null,
                    otp: null,
                });
                return { message: "Verify success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        login: async (parent, { phone, password, email, type }) => {
            try {
                let query = { verifed: true };
                if (type) query.phone = phone;
                else query.email = email;
                const userExisted = await User.findOne({ ...query });
                if (!userExisted) {
                    return new AuthenticationError("User not found", 404);
                }
                const isMatch = await bcrypt.compare(
                    password,
                    userExisted.password
                );

                if (!isMatch) {
                    return new AuthenticationError(
                        "Password is incorrect.",
                        400
                    );
                }
                userExisted.isOnline = true;
                await userExisted.save();
                return {
                    user: userExisted,
                    ...(await issueToken(userExisted._id)),
                };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        logout: async (parent, args, { req }, info) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User not authenticated");
                }
                req.user.isOnline = false;
                await req.user.save();
                return { message: "Logout success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        forgotPassword: async (parent, { phone, email, type }) => {
            try {
                let query = { verifed: true };
                if (type) query.phone = phone;
                else query.email = email;
                const user = await User.findOne(query);
                if (!user) {
                    return new ApolloError("User not found", "404");
                }
                // await client.verify.services(serviceId).verifications.create({
                //     to: "+84" + phone.slice(1),
                //     channel: "sms",
                // });
                const otp = (Date.now() + "").slice(7);
                if (type) {
                    await client.messages
                        .create({
                            body: `Please verify with OTP : ${otp}`,
                            from: "+16614909715",
                            to: "+84" + phone.slice(1),
                        })
                        .then((message) => console.log(message.sid))
                        .catch((err) => {
                            console.log(err);
                            throw new Error(
                                "Service is busy, please again",
                                500
                            );
                        });
                } else {
                    sendEmail(email, otp);
                }
                return { message: "Send otp to phone number" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        checkOTPForgot: async (parent, { phone, otp, email, type }) => {
            try {
                let query = { verifed: true };
                if (type) query.phone = phone;
                else query.email = email;
                const user = await User.findOne(query);
                if (!user) {
                    return new ApolloError("User not found", "404");
                }
                if (otp !== user.otp) {
                    return new ApolloError("OTP is invalid", "400");
                }
                if (moment(user.expired) < new Date()) {
                    return new ApolloError("OTP is expired", "400");
                }
                // await client.verify
                //     .services(serviceId)
                //     .verificationChecks.create({
                //         to: "+84" + user.phone.slice(1),
                //         code: otp,
                //     })
                //     .then((verified) => {
                //         console.log(verified);
                //         if (verified.status === "pending") {
                //             throw new ApolloError("OTP incorrect", 400);
                //         }
                //     })
                //     .catch((e) => {
                //         console.log(e);
                //         throw new ApolloError("OTP expired", 400);
                //     });

                return await createToken(user._id, "5m");
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        register: async (parent, args, { req }) => {
            try {
                let query = {};
                if (args.type) {
                    query.phone = args.newUser.phone;
                } else {
                    query.email = args.newUser.email;
                }
                const userExisted = await User.findOne(query);
                if (userExisted) {
                    return new ApolloError(
                        "Phone or email is already registered",
                        500
                    );
                }
                const hashPassword = await bcrypt.hash(
                    args.newUser.password,
                    12
                );
                const otp = (Date.now() + "").slice(7);
                const newUser = new User({
                    ...args.newUser,
                    password: hashPassword,
                    otp,
                    expired: new Date(moment().add(5, "minutes")),
                    email: args.type ? "" : args.newUser.email,
                    phone: args.type ? args.newUser.phone : "",
                });
                if (args.type) {
                    await client.messages
                        .create({
                            body: `Please verify with OTP : ${otp}`,
                            from: "+16614909715",
                            to: "+84" + newUser.phone.slice(1),
                        })
                        .then((message) => console.log(message.sid))
                        .catch((err) => {
                            console.log(err);
                            throw new Error(
                                "Service is busy, please again",
                                500
                            );
                        });
                } else {
                    sendEmail(args.newUser.email, otp);
                }
                // await client.verify.services(serviceId).verifications.create({
                //     to: "+84" + newUser.phone.slice(1),
                //     channel: "sms",
                // });

                await newUser.save();
                return { message: "Success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateUserRole: async (parent, { role, id }, { req }) => {
            try {
                if (!(await checkPermission(req, ROLE.ADMIN))) {
                    return new AuthenticationError("User not authenticated");
                }
                const userExisted = await User.findById(id).select("-password");
                if (!userExisted) {
                    return new AuthenticationError("User not found", 404);
                }
                if (userExisted.role === role) return { message: "Role equal" };
                userExisted.role = role;
                await userExisted.save();
                return { message: "Update role success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateUserInfo: async (parent, { userUpdate }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true))) {
                    return new AuthenticationError("User not authenticated");
                }
                for (let key in userUpdate) {
                    if (!userUpdate[key]) delete userUpdate[key];
                }
                await User.updateOne({ _id: req.user.id }, userUpdate);
                return { message: "Update success!" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        resetPassword: async (parent, { token, password }, { req }) => {
            try {
                if (!(await checkResetPassword(req, token))) {
                    return new AuthenticationError(
                        "User password reset information is not valid."
                    );
                }
                const hashPassword = await bcrypt.hash(password, 12);
                req.user.password = hashPassword;
                await req.user.save();
                return { message: "Reset password success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        changePassword: async (
            parent,
            { oldPassword, newPassword },
            { req }
        ) => {
            try {
                if (!(await checkSignedIn(req, true, true))) {
                    return new AuthenticationError("User not authenticated");
                }
                const isMatch = await bcrypt.compare(
                    oldPassword,
                    req.user.password
                );

                if (!isMatch) {
                    return new ApolloError("Old password incorrect", 400);
                }
                const hashPassword = await bcrypt.hash(newPassword, 12);
                req.user.password = hashPassword;
                await User.updateOne(
                    { _id: req.user._id },
                    { password: hashPassword }
                );
                return { message: "Change password success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        updateCart: async (parent, { dataCart }, { req }) => {
            try {
                if (!(await checkSignedIn(req, true, true))) {
                    return new AuthenticationError("User not authenticated");
                }
                await User.updateOne({ _id: req.user._id }, { cart: dataCart });
                return { message: "Change password success" };
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
