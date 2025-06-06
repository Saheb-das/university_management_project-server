// external import
import express from "express";

// internal import
import noteController from "../controller/note";

// create router
const router = express.Router();

// routes
router.post("/materials", noteController.createMaterial);

router.get("/materials/batches/:batchId", noteController.getNotesByBatchId);

router.get("/materials/:teacherId", noteController.getNotesByTeacherId);

router.get("/materials/:noteId/doc", noteController.getNoteDoc);

// export
export default router;
