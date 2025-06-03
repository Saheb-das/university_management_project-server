// external import
import express from "express";

// internal import
import studentController from "../controller/student";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.get("/", checkPermission("read_student"), studentController.getStudents);

router.get("/batch", studentController.getStudentsByBatchId);

router.patch(
  "/:id/status",
  checkPermission("update_student"),
  studentController.changeStatus
);

router.patch(
  "/:id/set-identifier",
  studentController.updateStudentRollAndRegById
);

// export
export default router;
