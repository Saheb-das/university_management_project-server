// external import
import express from "express";

// internal import
import noteController from "../controller/note";

// create router
const router = express.Router();

// routes
router.post("/", noteController.createNote);

router.get("/", noteController.getNotes);

router.get("/:id", noteController.getNote);

router.patch("/:id", noteController.updateNote);

router.delete("/:id", noteController.deleteNote);

// export
export default router;
