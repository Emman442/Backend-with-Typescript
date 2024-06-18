import jwt, { Secret } from "jsonwebtoken";
import UserToken from "../models/usertoken";
import AppError from "./appError";
import { NextFunction } from "express";

const verifyToken = async(token: string, secret: Secret, next: NextFunction) => {
  try {
    const savedToken = await UserToken.findOne({ where: { token } });
    if (!savedToken) {
      return next(new AppError("Invalid Refresh tokens", "404"));
    }
    return jwt.verify(savedToken.token, secret);
  } catch (err) {
    console.error("Token verification error", err);
    throw err;
  }
};

export default verifyToken;
