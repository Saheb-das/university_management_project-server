// external import
import express from "express";

// internal import
import courseController from "../controller/course";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.post(
  "/",
  checkPermission("create_course"),
  courseController.createCourse
);

router.get("/", checkPermission("read_course"), courseController.getCourses);

router.get("/:id", courseController.getCourse);

router.patch("/:id", courseController.updateCourse);

router.delete("/:id", courseController.deleteCourse);

// export
export default router;
