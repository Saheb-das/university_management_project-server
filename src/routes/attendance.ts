// external imoprt
import express from "express";

// internal import
import attendanceController from "../controller/attendance";

// create router
const router = express.Router();

// routes

router.post("/", attendanceController.createAttendance);

router.get(
  "/students/:studentId",
  attendanceController.getAttendanceCountByStudentId
);

// exoprt
export default router;
