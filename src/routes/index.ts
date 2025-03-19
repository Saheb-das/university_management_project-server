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

// create router
const router = express.Router();

// routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/transactions", transactionRoutes);
router.use("/routines", routineRoutes);
router.use("/attendances", attendanceRoutes);
router.use("/notes", noteRoutes);
router.use("/projects", projectRoutes);
router.use("/events", eventRoutes);
router.use("/results", resultRoutes);
router.use("/uploads", uploadRoutes);

// export
export default router;
