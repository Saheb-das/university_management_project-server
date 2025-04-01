// external import
import express from "express";

// internal import
import authController from "../controller/auth";

// create router
const router = express.Router();

// routes
router.post("/register", authController.register);

router.post("/login", authController.login);

// export
export default router;
