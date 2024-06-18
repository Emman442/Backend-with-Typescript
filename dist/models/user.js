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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
//Validator.js express-validator.js
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../db/database"));
class User extends sequelize_1.Model {
    createOtp() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otp = otp;
        this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        return otp;
    }
    validPassword(password) {
        return bcryptjs_1.default.compareSync(password, this.password);
    }
    static associate(models) {
        // define association here if needed
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    otpExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    profile_photo: {
        type: sequelize_1.DataTypes.STRING,
        // allowNull: false 
    },
    verificationToken: {
        type: sequelize_1.DataTypes.STRING,
        // allowNull: true 
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    sequelize: database_1.default,
    modelName: "User",
    tableName: "Users", // Optional: If you want to specify table name explicitly
    timestamps: true, // Optional: If you want Sequelize to manage createdAt and updatedAt fields
    hooks: {
        beforeCreate: (user) => __awaiter(void 0, void 0, void 0, function* () {
            user.password = yield bcryptjs_1.default.hash(user.password, 10);
        }),
        beforeUpdate: (user) => __awaiter(void 0, void 0, void 0, function* () {
            if (user.changed("password")) {
                user.password = yield bcryptjs_1.default.hash(user.password, 10);
            }
        }),
    },
});
exports.default = User;
