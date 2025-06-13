// external import
import express from "express";

// internal import
import authRoutes from "./auth";
import userRoutes from "./user";
import courseRoutes from "./course";
import transactionRoutes from "./transaction";
import routineRoutes from "./routine";
import attendanceRoutes from "./attendance";
import projectRoutes from "./project";
import eventRoutes from "./event";
import resultRoutes from "./result";
import uploadRoutes from "./upload";
import collageRoutes from "./collage";
import subjectRoutes from "./subject";
import batchRoutes from "./batch";
import admisssionRoutes from "./admission";
import studentRoutes from "./student";
import asignTeacherRoutes from "./asign-teacher";
import noteRoutes from "./note";
import examRoutes from "./exam";
import formRoutes from "./form";
import statsRoutes from "./statistic";
import razorpayRoutes from "./razorpay";
import { authenticateHTTP } from "../middleware/authenticate";

// create router
const router = express.Router();

// routes
router.use("/auth", authRoutes);
router.use("/users", authenticateHTTP, userRoutes);
router.use("/collages", authenticateHTTP, collageRoutes);
router.use("/courses", authenticateHTTP, courseRoutes);
router.use("/subjects", authenticateHTTP, subjectRoutes);
router.use("/transactions", authenticateHTTP, transactionRoutes);
router.use("/admissions", authenticateHTTP, admisssionRoutes);
router.use("/asign-teachers", authenticateHTTP, asignTeacherRoutes);
router.use("/students", authenticateHTTP, studentRoutes);
router.use("/routines", authenticateHTTP, routineRoutes);
router.use("/notes", authenticateHTTP, noteRoutes);
router.use("/exams", authenticateHTTP, examRoutes);
router.use("/attendances", authenticateHTTP, attendanceRoutes);
router.use("/batches", authenticateHTTP, batchRoutes);
router.use("/forms", authenticateHTTP, formRoutes);
router.use("/stats", authenticateHTTP, statsRoutes);
router.use("/projects", authenticateHTTP, projectRoutes);
router.use("/events", authenticateHTTP, eventRoutes);
router.use("/results", authenticateHTTP, resultRoutes);
router.use("/uploads", authenticateHTTP, uploadRoutes);
router.use("/razorpays", authenticateHTTP, razorpayRoutes);

// export
export default router;
