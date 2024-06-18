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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usertoken_1 = __importDefault(require("../models/usertoken"));
console.log(process.env.ACCESS_TOKEN_PRIVATE_KEY);
const generateTokens = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = { id: user.id };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: "14m" });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_PRIVATE_KEY, { expiresIn: "30d" });
        const userToken = yield usertoken_1.default.findOne({ where: { userId: user.id.toString() } });
        if (userToken)
            yield userToken.destroy();
        yield usertoken_1.default.create({ userId: user.id, token: refreshToken });
        return Promise.resolve({ accessToken, refreshToken });
    }
    catch (err) {
        console.log("Error from Generate token", err);
        return Promise.reject(err);
    }
});
exports.default = generateTokens;
