// internal import
import prisma from "../lib/prisma";

// types import
import { Prisma, Stuff, UserRole } from "@prisma/client";

async function findByUserId(userId: string): Promise<Stuff | null> {
  const stuff = await prisma.stuff.findFirst({
    where: {
      profile: {
        userId: userId,
      },
    },
  });

  return stuff;
}

async function findById(stuffId: string): Promise<Stuff | null> {
  const stuff = await prisma.stuff.findUnique({
    where: {
      id: stuffId,
    },
  });

  return stuff;
}

type StuffWithUserId = Prisma.StuffGetPayload<{
  include: {
    profile: {
      select: {
        userId: true;
      };
    };
  };
}>;
async function findByIdAndRole(
  stuffId: string,
  role: UserRole
): Promise<StuffWithUserId | null> {
  const stuff = await prisma.stuff.findUnique({
    where: {
      id: stuffId,
      profile: {
        user: {
          role: role,
        },
      },
    },
    include: {
      profile: {
        select: {
          userId: true,
        },
      },
    },
  });

  return stuff;
}

// export
export default {
  findByUserId,
  findById,
  findByIdAndRole,
};
