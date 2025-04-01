// external import
import express from "express";

// internal import
import collageController from "../controller/collage";
import { checkPermission } from "../middleware/permission";

// create router
const router = express.Router();

// routes
router.patch(
  "/:id",
  checkPermission("update_collage"),
  collageController.updateCollage
);

router.post("/:id/departments");

// export
export default router;
