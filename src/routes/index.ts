// external import
import express from "express";

// internal import
import authRoutes from "./auth";
import userRoutes from "./user";
import courseRoutes from "./course";
import transactionRoutes from "./transaction";
import routineRoutes from "./routine";
import attendanceRoutes from "./attendance";
import noteRoutes from "./note";
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
import studyroomRoutes from "./studyroom";
import examRoutes from "./exam";
import formRoutes from "./form";
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
router.use("/studyrooms", authenticateHTTP, studyroomRoutes);
router.use("/exams", authenticateHTTP, examRoutes);
router.use("/attendances", attendanceRoutes);
router.use("/batches", authenticateHTTP, batchRoutes);
router.use("/notes", noteRoutes);
router.use("/forms", authenticateHTTP, formRoutes);
router.use("/projects", projectRoutes);
router.use("/events", eventRoutes);
router.use("/results", authenticateHTTP, resultRoutes);
router.use("/uploads", authenticateHTTP, uploadRoutes);

// export
export default router;
