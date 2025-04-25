// external imoprt
import express from "express";

// internal import
import uploadController from "../controller/upload";
import { upload } from "../multer";

// create router
const router = express.Router();

// routes
router.post(
  "/profile-pic",
  upload.single("profilePic"),
  uploadController.createNewUpload
);

router.post(
  "/document",
  upload.single("document"),
  uploadController.createNewUpload
);

router.post(
  "/project",
  upload.single("project"),
  uploadController.createNewUpload
);

router.post("/event", upload.single("event"), uploadController.createNewUpload);

router.patch(
  "/profile-pic",
  upload.single("profilePic"),
  uploadController.changeUpload
);

router.patch(
  "/document",
  upload.single("document"),
  uploadController.changeUpload
);

router.patch(
  "/project",
  upload.single("project"),
  uploadController.changeUpload
);

router.patch("/event", upload.single("event"), uploadController.changeUpload);

// export
export default router;
