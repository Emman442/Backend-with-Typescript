"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const upload_1 = __importDefault(require("../utils/upload"));
const router = (0, express_1.Router)();
router.post("/signup", userController_1.signup);
router.get("/get-all-users", userController_1.getUsers);
router.post("/login", userController_1.login);
router.put("/forgot-password", userController_1.forgotPassword);
router.put("/reset-password", userController_1.resetPassword);
router.put("/update-profile", userController_1.protect, upload_1.default.single("photo"), userController_1.updateProfile);
router.get("/verfy-email", userController_1.verifyEmail);
exports.default = router;
