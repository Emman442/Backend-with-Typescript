"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../db/database"));
class UserToken extends sequelize_1.Model {
    static associate(models) {
        // define association here if needed
    }
}
UserToken.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    modelName: "UserToken",
    tableName: "UserTokens", // Optional: If you want to specify table name explicitly
    timestamps: true, // Optional: If you want Sequelize to manage createdAt and updatedAt fields
});
exports.default = UserToken;
