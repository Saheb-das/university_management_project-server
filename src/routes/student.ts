// external import
import express from "express";

// internal import
import studentController from "../controller/student";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.get("/", checkPermission("read_student"), studentController.getStudents);

router.patch(
  "/:id/status",
  checkPermission("update_student"),
  studentController.changeStatus
);

// export
export default router;
