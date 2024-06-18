import bcrypt from "bcryptjs";
//Validator.js express-validator.js

import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../db/database";

class User extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public profile_photo!: string;
  public verificationToken!: string| null;
  public password!: string;
  public otp?: string | null | undefined;
  public otpExpires?: Date | null;
  public isVerified ?: Boolean | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public createOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    return otp;
  }

  public validPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
  static associate(models: any) {
    // define association here if needed
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail:  true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profile_photo: {
      type: DataTypes.STRING,
      // allowNull: false 
    },
    verificationToken: {
      type: DataTypes.STRING,
      // allowNull: true 
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users", // Optional: If you want to specify table name explicitly
    timestamps: true, // Optional: If you want Sequelize to manage createdAt and updatedAt fields
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default User;