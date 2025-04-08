// external import
import express from "express";

// internal import
import subjectController from "../controller/subject";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.post(
  "/",
  checkPermission("create_subject"),
  subjectController.createSubjects
);

// export
export default router;
