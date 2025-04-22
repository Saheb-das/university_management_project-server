// external import
import express from "express";

// internal import
import examController from "../controller/exam";

// create router
const router = express.Router();

// routes
router.post("/", examController.createExams);

router.get("/courses/:courseId", examController.getExamsByCourseId);

// export
export default router;
