// external import
import express from "express";

// internal import
import resultController from "../controller/result";

// create router
const router = express.Router();

// routes
router.post("/", resultController.createResult);

router.get(
  "/students/:studentId/exam/:examId",
  resultController.getResultByStudentExamSem
);

router.get("/sems/:semId", resultController.getResultBySemBatchStudentIds);

router.get("/students/:studentId", resultController.getResultByStudentIdAndSem);

router.patch("/:id", resultController.updateResult);

// export
export default router;
