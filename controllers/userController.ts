import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, RequestHandler } from "express";
import User from "../models/user";
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import generateTokens from "../utils/generateToken";
import Email from "../utils/Email";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password } = req.body;

  const userAlreadyExists = await User.findOne({ where: { email } });
  if (userAlreadyExists) {
    return next(new AppError("User Already Exists!", "400"));
  }
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const newUser = await User.create({
    firstName,
    lastName,
    password,
    email,
    verificationToken,
  });

  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/verify-email?token=${verificationToken}`;
  console.log(verificationUrl)
  await new Email(newUser, verificationUrl, "").sendVerificationEmail();
  res.status(200).json({
    status: "success",
    message: "User Created Successfully",
    data: {
      newUser,
    },
  });
};

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    await new Email(user, "", "").sendWelcome()

    res
      .status(200)
      .json({
        status: "success",
        message: "Email verified successfully",
        data: { user },
      });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please Enter email or password", "404"));
    }
    try {
      const user = await User.findOne({ where: { email } });
      const validPassword = user?.validPassword(password);
      console.log(validPassword);
      if (!user || !validPassword) {
        return next(
          new AppError("Either Email or password is Incorrect", "404")
        );
      }

      const { refreshToken, accessToken } = await generateTokens(user);
      res.status(200).json({
        status: "success",
        refreshToken,
        accessToken,
        data: { user },
      });
    } catch (error) {
      console.error("Error during user lookup:", error);
      return next(new AppError("An error occurred during user lookup", "500"));
    }
  }
);

interface JwtPayload {
  id: number;
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_PRIVATE_KEY as string
    ) as JwtPayload;
    const user: any = await User.findByPk(decoded.id);
    console.log(user);
    if (!user) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exist.",
      });
    }

    req.user = user;
    next();
    // console.log("Request User :  ",req.user)
  } catch (err) {
    next();
    return res
      .status(401)
      .json({ message: "Invalid token. Please log in again." });
  }
};

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return next(new AppError("There is no user with email address.", "404"));
    }
    const otp = user.createOtp();
    await user.save();

    try {
      await new Email(user, "", otp).sendPasswordReset();

      res.status(200).json({
        status: "success",
        message: "OTP sent to email!",
      });
    } catch (err) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      console.error(err);
      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          "500"
        )
      );
    }
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (
      !user ||
      !user.otp ||
      user.otpExpires! < new Date() ||
      user.otp !== otp
    ) {
      return next(new AppError("OTP is invalid or has expired.", "400"));
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password has been reset!",
    });
  }
);

const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName } = req.body;
      const filePath = req.file ? req.file.path : null;
      console.log(req.user?.id);

      const user = await User.findByPk(req.user?.id);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      if (filePath && user.profile_photo) {
        const oldPhotoPath = path.join(__dirname, "..", user.profile_photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      if (filePath) {
        user.profile_photo = filePath;
      }
      await user.save();

      res.status(200).send({ message: "User updated successfully", user });
    } catch (error: any) {
      res.status(500).send({ message: "Server error", error: error.message });
    }
  }
);

const getUsers = async (req: Request, res: Response) => {
  const users = await User.findAll();
  res.status(200).json({
    status: "success",
    length: users.length,
    message: "Users fetched  Successfully",
    data: {
      users,
    },
  });
};

export {
  verifyEmail,
  signup,
  getUsers,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updateProfile,
};
