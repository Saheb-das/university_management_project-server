// external imoprt
import express from "express";

// internal import
import attendanceController from "../controller/attendance";

// create router
const router = express.Router();

// routes

router.post("/", attendanceController.createAttendance);

router.get("/", attendanceController.getAttendances);

router.get("/:id", attendanceController.getAttendance);

router.patch("/:id", attendanceController.updateAttendance);

router.delete("/:id", attendanceController.deleteAttendance);

// exoprt
export default router;
