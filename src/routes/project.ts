// external import
import express from "express";

// internal import
import projectController from "../controller/project";

// create router
const router = express.Router();

// routes
router.post("/", projectController.createProject);

router.get("/", projectController.getProjects);

router.get("/", projectController.getProject);

router.post("/", projectController.updateProject);

router.post("/", projectController.deleteProject);

// export
export default router;
