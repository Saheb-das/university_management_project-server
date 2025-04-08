// external import
import express from "express";

// internal import
import { checkPermission } from "../middleware/permission";
import batchController from "../controller/batch";

// create router
const router = express.Router();

// routes
router.post("/", batchController.createBatch);

router.get("/", batchController.getBatchByName);

// export
export default router;
