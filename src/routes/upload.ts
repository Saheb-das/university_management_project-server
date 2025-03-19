// external import
import express from "express";

// internal import
import uploadController from "../controller/upload";

// create router
const router = express.Router();

// routes
router.post("/", uploadController.createUpload);

router.get("/", uploadController.getUploads);

router.get("/:id", uploadController.getUploads);

router.patch("/:id", uploadController.updateUpload);

router.delete("/:id", uploadController.deleteUpload);

// export
export default router;
