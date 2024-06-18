"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('users', 'postgres', 'Emmanuel2002', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
});
exports.default = sequelize;
