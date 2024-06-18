import { Router } from "express";
import {signup, getUsers, login, protect, forgotPassword, resetPassword, updateProfile, verifyEmail } from "../controllers/userController";
import upload from "../utils/upload";
const router = Router();

router.post("/signup",  signup);
router.get("/get-all-users", getUsers);
router.post("/login", login);
router.put("/forgot-password", forgotPassword )
router.put("/reset-password",  resetPassword)
router.put("/update-profile", protect, upload.single("photo"), updateProfile)
router.get("/verfy-email", verifyEmail)
export default router;
