import jwt, { Secret } from "jsonwebtoken";
import UserToken from "../models/usertoken";
import User from "../models/user";
import { DataTypes, Sequelize } from "sequelize";

console.log(process.env.ACCESS_TOKEN_PRIVATE_KEY);

const generateTokens = async (user: User) => {
  try {
    const payload = { id: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_PRIVATE_KEY as Secret,
      { expiresIn: "14m" }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_PRIVATE_KEY as Secret,
      { expiresIn: "30d" }
    );

    const userToken = await UserToken.findOne({ where: { userId: user.id.toString() } });
    if (userToken) await userToken.destroy();

    await  UserToken.create({ userId: user.id, token: refreshToken })
    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    console.log("Error from Generate token", err);
    return Promise.reject(err);
  }
};

export default generateTokens;
