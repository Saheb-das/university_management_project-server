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
router.use("/routines", routineRoutes);
router.use("/attendances", attendanceRoutes);
router.use("/batches", authenticateHTTP, batchRoutes);
router.use("/notes", noteRoutes);
router.use("/projects", projectRoutes);
router.use("/events", eventRoutes);
router.use("/results", resultRoutes);
router.use("/uploads", uploadRoutes);

// export
export default router;
