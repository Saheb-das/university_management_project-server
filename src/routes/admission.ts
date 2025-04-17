// external imoprt
import express from "express";

// internal import
import admissionController from "../controller/admission";

// create router
const router = express.Router();

// routes
router.post("/", admissionController.createAdmission);

router.get("/", admissionController.getAdmissions);

// export
export default router;
