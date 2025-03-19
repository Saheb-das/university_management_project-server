// external import
import express from "express";

// internal import
import userController from "../controller/user";

// create router
const router = express.Router();

// routes
router.post("/", userController.createUser);

router.get("/", userController.getUsers);

router.get("/:id", userController.getUser);

router.patch("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

// export
export default router;
