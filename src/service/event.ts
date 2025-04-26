// internal import
import collageRepository from "../repository/collage";
import eventRepository, { TEvent } from "../repository/event";

// types import
import { Event } from "@prisma/client";
import { TEventClient } from "../zod/event";
import { CustomError } from "../lib/error";

async function createEvent(
  collageId: string,
  eventInfo: TEventClient
): Promise<Event | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const eventPayload: TEvent = {
      title: eventInfo.title,
      place: eventInfo.place,
      type: eventInfo.type,
      date: eventInfo.date,
      time: eventInfo.time,
      avatar: eventInfo.avatar || "",
      url: eventInfo.url || "",
    };

    const newEvent = await eventRepository.create(collage.id, eventPayload);
    if (!newEvent) {
      throw new CustomError("event not created", 500);
    }

    return newEvent;
  } catch (error) {
    console.log("Error create event", error);
    return null;
  }
}

export type EventQuery = {
  eventType?: string;
  eventDate?: string;
};
async function getAllEvents(
  collageId: string,
  eQuery: EventQuery
): Promise<Event[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const events = await eventRepository.findAllByProps(collage.id, eQuery);
    if (!events) {
      throw new CustomError("events not found", 404);
    }

    return events;
  } catch (error) {
    console.log("Error fetching events", error);
    return null;
  }
}

// export
export default {
  createEvent,
  getAllEvents,
};
