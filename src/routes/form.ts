// external imoprt
import express from "express";

// internal import
import formController from "../controller/form";

// create router
const router = express.Router();

// routes
router.post("/", formController.createForm);

router.post("/submit/student", formController.submitStudentForm);

router.post("/submit/other", formController.submitOtherForm);

router.get("/submit/data", formController.getSubmittedFormData);

router.get("/", formController.getForms);

router.get("/form-titles", formController.getFormTitles);

router.get("/identity", formController.getFormByIdentity);

router.delete("/:formId", formController.deleteForm);

// export
export default router;
