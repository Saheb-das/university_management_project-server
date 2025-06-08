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

// export
export default router;
