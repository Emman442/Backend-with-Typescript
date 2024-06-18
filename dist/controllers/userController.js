"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.protect = exports.login = exports.getUsers = exports.signup = exports.verifyEmail = void 0;
const user_1 = __importDefault(require("../models/user"));
const appError_1 = __importDefault(require("../utils/appError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const Email_1 = __importDefault(require("../utils/Email"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    const userAlreadyExists = yield user_1.default.findOne({ where: { email } });
    if (userAlreadyExists) {
        return next(new appError_1.default("User Already Exists!", "400"));
    }
    const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
    const newUser = yield user_1.default.create({
        firstName,
        lastName,
        password,
        email,
        verificationToken,
    });
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/user/verify-email?token=${verificationToken}`;
    console.log(verificationUrl);
    yield new Email_1.default(newUser, verificationUrl, "").sendVerificationEmail();
    res.status(200).json({
        status: "success",
        message: "User Created Successfully",
        data: {
            newUser,
        },
    });
});
exports.signup = signup;
const verifyEmail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    try {
        const user = yield user_1.default.findOne({ where: { verificationToken: token } });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired verification token" });
        }
        user.isVerified = true;
        user.verificationToken = null;
        yield user.save();
        yield new Email_1.default(user, "", "").sendWelcome();
        res
            .status(200)
            .json({
            status: "success",
            message: "Email verified successfully",
            data: { user },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
exports.verifyEmail = verifyEmail;
const login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Please Enter email or password", "404"));
    }
    try {
        const user = yield user_1.default.findOne({ where: { email } });
        const validPassword = user === null || user === void 0 ? void 0 : user.validPassword(password);
        console.log(validPassword);
        if (!user || !validPassword) {
            return next(new appError_1.default("Either Email or password is Incorrect", "404"));
        }
        const { refreshToken, accessToken } = yield (0, generateToken_1.default)(user);
        res.status(200).json({
            status: "success",
            refreshToken,
            accessToken,
            data: { user },
        });
    }
    catch (error) {
        console.error("Error during user lookup:", error);
        return next(new appError_1.default("An error occurred during user lookup", "500"));
    }
}));
exports.login = login;
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({ message: "You are not logged in!" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
        const user = yield user_1.default.findByPk(decoded.id);
        console.log(user);
        if (!user) {
            return res.status(401).json({
                message: "The user belonging to this token does no longer exist.",
            });
        }
        req.user = user;
        next();
        // console.log("Request User :  ",req.user)
    }
    catch (err) {
        next();
        return res
            .status(401)
            .json({ message: "Invalid token. Please log in again." });
    }
});
exports.protect = protect;
const forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ where: { email: req.body.email } });
    if (!user) {
        return next(new appError_1.default("There is no user with email address.", "404"));
    }
    const otp = user.createOtp();
    yield user.save();
    try {
        yield new Email_1.default(user, "", otp).sendPasswordReset();
        res.status(200).json({
            status: "success",
            message: "OTP sent to email!",
        });
    }
    catch (err) {
        user.otp = null;
        user.otpExpires = null;
        yield user.save();
        console.error(err);
        return next(new appError_1.default("There was an error sending the email. Try again later!", "500"));
    }
}));
exports.forgotPassword = forgotPassword;
const resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = req.body;
    const user = yield user_1.default.findOne({ where: { email } });
    if (!user ||
        !user.otp ||
        user.otpExpires < new Date() ||
        user.otp !== otp) {
        return next(new appError_1.default("OTP is invalid or has expired.", "400"));
    }
    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    yield user.save();
    res.status(200).json({
        status: "success",
        message: "Password has been reset!",
    });
}));
exports.resetPassword = resetPassword;
const updateProfile = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { firstName, lastName } = req.body;
        const filePath = req.file ? req.file.path : null;
        console.log((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const user = yield user_1.default.findByPk((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        if (filePath && user.profile_photo) {
            const oldPhotoPath = path_1.default.join(__dirname, "..", user.profile_photo);
            if (fs_1.default.existsSync(oldPhotoPath)) {
                fs_1.default.unlinkSync(oldPhotoPath);
            }
        }
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        if (filePath) {
            user.profile_photo = filePath;
        }
        yield user.save();
        res.status(200).send({ message: "User updated successfully", user });
    }
    catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
}));
exports.updateProfile = updateProfile;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.default.findAll();
    res.status(200).json({
        status: "success",
        length: users.length,
        message: "Users fetched  Successfully",
        data: {
            users,
        },
    });
});
exports.getUsers = getUsers;
