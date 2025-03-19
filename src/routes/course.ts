// external import
import express from "express";

// internal import
import courseController from "../controller/course";

// create router
const router = express.Router();

// routes
router.post("/", courseController.createCourse);

router.get("/", courseController.getCourses);

router.get("/:id", courseController.getCourse);

router.patch("/:id", courseController.updateCourse);

router.delete("/:id", courseController.deleteCourse);

// export
export default router;
