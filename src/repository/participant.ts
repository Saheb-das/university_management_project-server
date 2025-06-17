// internal import
import prisma from "../lib/prisma";

// types import
import { Participant, UserRole } from "@prisma/client";

export interface IParticipant {
  role: UserRole;
  conId: string;
  userId: string;
}

async function create(payload: IParticipant): Promise<Participant> {
  const newPart = await prisma.participant.create({
    data: {
      role: payload.role,
      conversationId: payload.conId,
      userId: payload.userId,
    },
  });

  return newPart;
}

export interface IPartQuery {
  userId: string;
  collageId: string;
  conName: string;
}
async function findByConversationAndUserId(
  payload: IPartQuery
): Promise<Participant | null> {
  const participant = await prisma.participant.findFirst({
    where: {
      userId: payload.userId,
      conversation: {
        collageId: payload.collageId,
        name: payload.conName,
      },
    },
  });

  return participant;
}

export interface IRemovePart {
  role: UserRole;
  collageId: string;
  conName: string;
  userId: string;
}
async function remove(payload: IRemovePart): Promise<Participant | null> {
  const removedPart = await prisma.$transaction(async (tx) => {
    console.log(payload);

    // find participant
    const participant = await tx.participant.findFirst({
      where: {
        userId: payload.userId,
        role: payload.role,
        conversation: {
          collageId: payload.collageId,
          name: payload.conName,
        },
      },
    });

    if (!participant) {
      throw new Error("participant not found");
    }

    // delete participant
    const removed = await tx.participant.delete({
      where: {
        id: participant.id,
      },
    });
    console.log(removed);

    return removed;
  });

  return removedPart;
}

// export
export default {
  create,
  findByConversationAndUserId,
  remove,
};
