// external import
import express from "express";

// internal import
import { checkPermission } from "../middleware/permission";
import batchController from "../controller/batch";

// create router
const router = express.Router();

// routes
router.post("/", batchController.createBatch);

router.get("/", batchController.getBatches);

router.get("/:batchName", batchController.getBatchByName);

router.get("/:id/semesters", batchController.getBatchWithSemesters);

// export
export default router;
