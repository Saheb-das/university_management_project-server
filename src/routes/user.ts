// external import
import express from "express";

// internal import
import userController from "../controller/user";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.post("/", userController.createUser);

router.get("/", userController.getUsers);

router.get("/teachers", userController.getTeacherUsers);

router.get("/:id", userController.getUser);

router.patch("/:id", userController.updateUser);

router.patch("/:id/status", userController.updateUserStatus);

router.patch("/:id/change-password", userController.updateUserPassword);

router.delete("/:id", userController.deleteUser);

// export
export default router;
