// internal import
import eventService from "../service/event";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { CustomError } from "../lib/error";
import { eventSchema, TEventClient } from "../zod/event";

async function createEvent(
  req: AuthRequest<TEventClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const isValid = eventSchema.safeParse(req.body);
    if (!isValid.success) {
      console.log(isValid.error);

      throw new CustomError("invalid input", 400, isValid.error);
    }

    const newEvent = await eventService.createEvent(collageId, isValid.data);
    if (!newEvent) {
      throw new CustomError("event not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "event created successfully",
      newEvent: newEvent,
    });
  } catch (error) {
    next(error);
  }
}

async function getEvents(
  req: AuthRequest<{}, {}, { type?: string; date?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { date, type } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const eventQuery = {
      eventType: type || undefined,
      eventDate: date || undefined,
    };

    const events = await eventService.getAllEvents(collageId, eventQuery);
    if (!events) {
      throw new CustomError("events not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "event created successfully",
      events: events,
    });
  } catch (error) {
    next(error);
  }
}

async function getUpcomingEvents(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const events = await eventService.getUpcomingEvents(collageId);
    if (!events) {
      throw new CustomError("events not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "upcoming events fetched successfully",
      events: events,
    });
  } catch (error) {
    next(error);
  }
}

async function getEvent() {}
async function updateEvent() {}
async function deleteEvent() {}

// export
export default {
  createEvent,
  getEvents,
  getUpcomingEvents,
  getEvent,
  updateEvent,
  deleteEvent,
};
