const { APP_SECRET, APP_REFRESH_SECRET, APP_OTP_SECRET } = process.env;
const { AuthenticationError } = require("apollo-server-errors");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { ROLE } = require("../constants/index");

const issueToken = async (id) => {
    let token = "Bearer " + (await createToken(id));
    let refreshToken = await createToken(id, "7d");
    return { token, refreshToken };
};

const createToken = async (id, expiresIn = "1d") => {
    let secret =
        expiresIn === "1d"
            ? APP_SECRET
            : expiresIn === "5m"
            ? APP_OTP_SECRET
            : APP_REFRESH_SECRET;
    return await jwt.sign({ id }, secret, { expiresIn });
};

const checkSignedIn = async (req, requireAuth = false, type = false) => {
    const header = req.headers.authorization;
    if (header) {
        const token = header.replace("Bearer ", "");
        const decoded = await jwt.verify(token, APP_SECRET);
        const user = await User.findOne({
            _id: decoded.id,
            deletedAt: undefined,
        }).select(!type ? "-password" : "");
        if (!user) {
            throw new AuthenticationError("User not found.");
        }
        req.user = user;
        return true;
    }
    if (requireAuth) {
        throw new AuthenticationError("You must be logged in.");
    }
    return false;
};

const refreshToken = async (req) => {
    const header = req.headers.refresh_token;
    if (header) {
        const decoded = await jwt.verify(header, APP_REFRESH_SECRET);
        const user = await User.findOne({
            _id: decoded.id,
            deletedAt: undefined,
        }).select("-password");
        if (!user) {
            throw new AuthenticationError("Invalid user credentials.");
        }
        req.tokens = await issueToken(user._id);
        req.user = user;
        return true;
    }
    return false;
};

const checkPermission = async (req, role = [ROLE.MEMBER]) => {
    const header = req.headers.authorization;
    if (!header) {
        return false;
    }
    const token = header.replace("Bearer ", "");
    const decoded = await jwt.verify(token, APP_SECRET);
    const user = await User.findOne({
        _id: decoded.id,
        deletedAt: undefined,
    }).select("-password");
    if (!user) {
        throw new AuthenticationError("Invalid user credentials.");
    }
    if (!role.includes(user.role)) {
        throw new AuthenticationError("Permission denied.");
    }
    req.user = user;
    return true;
};

const checkResetPassword = async (req, token) => {
    const decoded = await jwt.verify(token, APP_OTP_SECRET);
    const user = await User.findOne({
        _id: decoded.id,
        deletedAt: undefined,
    }).select("-password");
    if (!user) {
        throw new AuthenticationError(
            "User password reset information is not valid."
        );
    }
    req.user = user;
    return true;
};

module.exports = {
    issueToken,
    refreshToken,
    checkSignedIn,
    checkPermission,
    createToken,
    checkResetPassword,
};
