// external import
import express from "express";

// internal import
import userController from "../controller/user";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// TODO: student and stuff are separated

// routes
router.post("/", userController.createUser);

router.get("/", userController.getUsers);

router.get("/:id", userController.getUser);

router.get("/:id/profile", userController.getUserProfile);

router.patch("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

// export
export default router;
