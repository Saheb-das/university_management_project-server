// external imoprt
import express from "express";

// internal import
import asignTeacherController from "../controller/asign-teacher";

// create router
const router = express.Router();

// routes
router.post("/:teacherId", asignTeacherController.asignTeacher);

router.get("/:teacherId/subjects", asignTeacherController.getSubjects);

router.delete("/:teacherId", asignTeacherController.removeSubjectFromTeacher);

// export
export default router;
