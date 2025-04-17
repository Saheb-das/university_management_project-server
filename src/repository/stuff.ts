// internal import
import prisma from "../lib/prisma";

// types import
import { Stuff, UserRole } from "@prisma/client";

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

async function findByIdAndRole(
  stuffId: string,
  role: UserRole
): Promise<Stuff | null> {
  const stuff = await prisma.stuff.findUnique({
    where: {
      id: stuffId,
      profile: {
        user: {
          role: role,
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
