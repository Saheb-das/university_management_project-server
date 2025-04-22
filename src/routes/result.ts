// external import
import express from "express";

// internal import
import resultController from "../controller/result";

// create router
const router = express.Router();

// routes
router.post("/", resultController.createResult);

router.get(
  "/students/:studentId",
  resultController.getResultByStudentIdAndExam
);

router.patch("/:id", resultController.updateResult);

// export
export default router;
