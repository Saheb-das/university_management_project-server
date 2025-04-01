// internal import
import prisma from "../lib/prisma";

// types import
import { TUser } from "../types";
import { User, UserRole } from "@prisma/client";

async function create(payload: TUser): Promise<User | null> {
  const newUser = await prisma.user.create({ data: payload });
  return newUser;
}

async function findById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return user;
}

async function findByEmailAndRole(
  email: string,
  role: UserRole
): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      role: role,
    },
  });
  return user;
}

// export
export default {
  create,
  findById,
  findByEmailAndRole,
};
