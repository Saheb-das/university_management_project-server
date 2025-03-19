// external imoprt
import express from "express";

// internal import
import attendanceController from "../controller/attendance";

// create router
const router = express.Router();

// routes

router.post("/", attendanceController.createAttendance);

router.get("/", attendanceController.getAttendances);

router.get("/", attendanceController.getAttendance);

router.patch("/", attendanceController.updateAttendance);

router.delete("/", attendanceController.deleteAttendance);

// exoprt
export default router;
