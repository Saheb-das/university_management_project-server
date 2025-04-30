// external imoprt
import express from "express";

// internal import
import formController from "../controller/form";

// create router
const router = express.Router();

// routes
router.post("/save", formController.createForm);

router.get("/", formController.getForms);

router.get("/:formId", formController.getForm);

router.delete("/:formId", formController.deleteForm);

// export
export default router;
