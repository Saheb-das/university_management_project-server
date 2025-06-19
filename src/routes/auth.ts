// external import
import express from "express";

// internal import
import authController from "../controller/auth";

// create router
const router = express.Router();

// routes
router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.post("/verify-otp", authController.verifyOTP);

router.post("/reset-password", authController.resetPassword);

router.get("/collages", authController.getCollages);

// export
export default router;
