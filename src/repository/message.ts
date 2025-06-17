import { Message, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export interface IMessage {
  content: string;
  userId: string;
  conId: string;
}
async function create(payload: IMessage): Promise<TMsgWithSender | null> {
  const newMessage = await prisma.message.create({
    data: {
      content: payload.content,
      senderId: payload.userId,
      conversationId: payload.conId,
    },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          profile: {
            select: {
              avatar: true,
            },
          },
        },
      },
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

interface GetMessagesOptions {
  conversationId: string;
  cursor?: string; // Message ID
  limit?: number;
}

export type TMsgWithSender = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        profile: {
          select: {
            avatar: true;
          };
        };
      };
    };
  };
}>;
export async function getMessagesPaginated({
  conversationId,
  cursor,
  limit = 15,
}: GetMessagesOptions): Promise<TMsgWithSender[]> {
  const msgs = prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "desc", // fetch latest first
    },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profile: {
            select: {
              avatar: true,
            },
          },
        },
      },
    },
  });

  return msgs;
}

// export
export default {
  create,
  findAllByConversationId,
  getMessagesPaginated,
};
