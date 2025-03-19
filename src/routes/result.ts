// external import
import express from "express";

// internal import
import resultController from "../controller/result";

// create router
const router = express.Router();

// routes
router.post("/", resultController.createResult);

router.get("/", resultController.getResults);

router.get("/:id", resultController.getResult);

router.patch("/:id", resultController.updateResult);

router.delete("/:id", resultController.deleteResult);

// export
export default router;
