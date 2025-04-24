import { Message, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export interface IMessage {
  content: string;
  userId: string;
  conId: string;
}
async function create(payload: IMessage): Promise<Message | null> {
  const newMessage = await prisma.message.create({
    data: {
      content: payload.content,
      senderId: payload.userId,
      conversationId: payload.conId,
    },
  });

  return newMessage;
}

type ConMessages = Prisma.MessageGetPayload<{
  include: {
    conversation: {
      select: {
        name: true;
      };
    };
  };
}>;
async function findAllByConversationId(
  conId: string
): Promise<ConMessages[] | null> {
  const messages = await prisma.message.findMany({
    where: {
      conversationId: conId,
    },
    include: {
      conversation: {
        select: {
          name: true,
        },
      },
    },
  });
  return messages;
}

// export
export default {
  create,
  findAllByConversationId,
};
