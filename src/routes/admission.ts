// external imoprt
import express from "express";

// internal import
import admissionController from "../controller/admission";

// create router
const router = express.Router();

// routes
router.post("/", admissionController.createAdmission);

router.get("/", admissionController.getAdmissions);

router.get("/top-three", admissionController.getTopThreeInPrevYear);

router.get(
  "/:userId/admits-coms",
  admissionController.getAdmissionsAndCommissions
);

router.get("/:userId/stats", admissionController.getPrevFiveYearsStats);

// export
export default router;
