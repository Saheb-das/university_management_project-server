// external import
import express from "express";

// internal import
import studyroomController from "../controller/studyroom";
import { upload } from "../multer";

// create router
const router = express.Router();

// routes
router.post(
  "/materials",
  upload.single("profilePic"),
  studyroomController.createMaterial
);

router.get("/materials/:teacherId", studyroomController.getNotesByTeacherId);

router.get("/materials/:noteId/doc", studyroomController.getNoteDoc);

// export
export default router;
