// external import
import express from "express";

// internal import
import routineController from "../controller/routine";

// create router
const router = express.Router();

// routes
router.post("/", routineController.createRoutine);

router.get("/", routineController.getRoutines);

router.get("/batch/:batch", routineController.getRoutineByBatchName);

router.get("/:id", routineController.getRoutine);

router.patch("/:id", routineController.updateRoutine);

router.delete("/:id", routineController.deleteRoutine);

// export
export default router;
