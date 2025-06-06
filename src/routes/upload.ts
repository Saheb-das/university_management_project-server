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

router.patch("/logo", upload.single("logo"), uploadController.changeLogo);

router.post(
  "/document",
  upload.single("document"),
  uploadController.uploadNewDoc
);

// router.post("/project", upload.single("project"), uploadController.newUpload);

// router.post("/event", upload.single("event"), uploadController.newUpload);

// export
export default router;
