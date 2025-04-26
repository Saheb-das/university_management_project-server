// external import
import express from "express";

// internal import
import studyroomController from "../controller/studyroom";

// create router
const router = express.Router();

// routes
router.post("/materials", studyroomController.createMaterial);

router.get(
  "/materials/batches/:batchId",
  studyroomController.getNotesByBatchId
);

router.get("/materials/:teacherId", studyroomController.getNotesByTeacherId);

router.get("/materials/:noteId/doc", studyroomController.getNoteDoc);

// export
export default router;
