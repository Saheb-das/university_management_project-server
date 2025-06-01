// internal import
import prisma from "../lib/prisma";

// types import
import { EventType, Event } from "@prisma/client";
import { EventQuery } from "../service/event";

export type TEvent = {
  title: string;
  date: string;
  place: string;
  time: string;
  avatar: string;
  type: EventType;
  url: string;
};

async function create(
  collageId: string,
  payload: TEvent
): Promise<Event | null> {
  const newEvent = await prisma.event.create({
    data: {
      title: payload.title,
      date: payload.date,
      place: payload.place,
      time: payload.time,
      avatar: payload.avatar,
      type: payload.type,
      url: payload.url,
      collageId: collageId,
    },
  });

  return newEvent;
}

async function findAllByProps(
  collageId: string,
  eQuery: EventQuery
): Promise<Event[] | null> {
  let whereClause: any;
  if (eQuery.eventDate && eQuery.eventType) {
    whereClause = {
      collageId: collageId,
      date: eQuery.eventDate,
      type: eQuery.eventType,
    };
  } else if (eQuery.eventDate) {
    whereClause = { collageId: collageId, date: eQuery.eventDate };
  } else if (eQuery.eventType) {
    whereClause = { collageId: collageId, type: eQuery.eventType };
  } else {
    whereClause = { collageId: collageId };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
  });

  return events;
}

async function findUpcomingEvents(collageId: string): Promise<Event[] | null> {
  const todayISO = new Date().toISOString();

  const events = await prisma.event.findMany({
    where: {
      collageId: collageId,
      date: {
        gte: todayISO, // events today or in the future
      },
    },
    orderBy: {
      date: "asc", // sort by closest date first
    },
  });

  return events;
}

// export
export default {
  create,
  findAllByProps,
  findUpcomingEvents,
};
