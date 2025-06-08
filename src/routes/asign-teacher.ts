// external imoprt
import express from "express";

// internal import
import asignTeacherController from "../controller/asign-teacher";

// create router
const router = express.Router();

// routes
router.get("/:teacherId/subjects", asignTeacherController.getSubjects);

router.get("/batches", asignTeacherController.getBatchesByTeacherUserId);

router.get(
  "/batches/:batchId/sems/:semId",
  asignTeacherController.getTeachersByBatchAndSem
);

router.post("/:teacherId", asignTeacherController.asignTeacher);

router.delete("/:teacherId", asignTeacherController.removeSubjectFromTeacher);

// export
export default router;
