// external import
import express from "express";

// internal import
import eventController from "../controller/event";

// create router
const router = express.Router();

// routes
router.post("/", eventController.createEvent);

router.get("/", eventController.getEvents);

router.get("/upcoming", eventController.getUpcomingEvents);

router.get("/:id", eventController.getEvent);

router.patch("/:id", eventController.updateEvent);

router.delete("/:id", eventController.deleteEvent);

// export
export default router;
