// internal import
import prisma from "../lib/prisma";

// types import
import { Conversation } from "@prisma/client";

export interface IConversation {
  conName: string;
  collageId: string;
}

async function create(payload: IConversation): Promise<Conversation | null> {
  const newCon = await prisma.conversation.create({
    data: {
      name: payload.conName,
      collageId: payload.collageId,
    },
  });

  return newCon;
}

async function findByNameAndCollageId(
  payload: IConversation
): Promise<Conversation | null> {
  const con = await prisma.conversation.findFirst({
    where: {
      name: payload.conName,
      collageId: payload.collageId,
    },
  });

  return con;
}

// export
export default {
  create,
  findByNameAndCollageId,
};
