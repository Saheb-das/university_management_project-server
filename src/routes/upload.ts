// external imoprt
import express from "express";

// internal import
import uploadController from "../controller/upload";
import { upload } from "../multer";

// create router
const router = express.Router();

// routes
router.patch(
  "/profile-pic",
  upload.single("profilePic"),
  uploadController.changeAvatar
);

// router.post("/document", upload.single("document"), uploadController.newUpload);

// router.post("/project", upload.single("project"), uploadController.newUpload);

// router.post("/event", upload.single("event"), uploadController.newUpload);

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
