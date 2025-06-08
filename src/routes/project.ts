// external import
import express from "express";

// internal import
import projectController from "../controller/project";
import { upload } from "../multer";

// create router
const router = express.Router();

// routes
router.post("/", projectController.createProject);

router.get("/", projectController.getProjects);

router.get("/:id", projectController.getProject);

router.patch("/:id", projectController.updateProject);

router.delete("/:id", projectController.deleteProject);

// export
export default router;
