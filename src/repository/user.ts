// internal import
import prisma from "../lib/prisma";
import { IBaseUser } from "../service/user";

// types import
import { Prisma, User, UserRole } from "@prisma/client";
import { TUser } from "../types";

async function createBaseWithProfile(
  userPayload: IBaseUser,
  collageId: string
): Promise<{
  tx: Prisma.TransactionClient;
  user: User;
  profileId: string;
}> {
  const result = await prisma.$transaction(async (tx) => {
    // create user
    const newUser = await prisma.user.create({
      data: {
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        email: userPayload.email,
        password: userPayload.password,
        role: userPayload.role,
        activeStatus: userPayload.activeStatus,
        collageId: collageId,
      },
    });

    // create profile
    const newProfile = await prisma.profile.create({
      data: {
        aadharNo: userPayload.aadharNo,
        address: userPayload.address,
        phoneNo: userPayload.phoneNo,
        userId: newUser.id,
      },
    });

    return { tx, user: newUser, profileId: newProfile.id };
  });

  return result;
}

async function create(payload: TUser): Promise<User | null> {
  const newUser = await prisma.user.create({
    data: payload,
  });

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
  createBaseWithProfile,
  create,
  findById,
  findByEmailAndRole,
};
