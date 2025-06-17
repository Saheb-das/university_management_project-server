// external import
import express from "express";

// internal import
import routineController from "../controller/routine";

// create router
const router = express.Router();

// routes
router.post("/", routineController.createRoutine);

router.get("/batch/:batch", routineController.getRoutineByBatchName);

router.get("/batch/:batchId/schedule", routineController.getScheduleByBatchId);

router.get("/lectures", routineController.getLecturesByTeacherUserIdAndDay);

// export
export default router;
