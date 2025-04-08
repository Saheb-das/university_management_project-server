// internal import
import prisma from "../lib/prisma";

// types import
import { Stuff, User } from "@prisma/client";
import { TStuff } from "../types";
import { TStuffClient } from "../zod/user";

async function create(payload: TStuff): Promise<Stuff | null> {
  const newStuff = await prisma.stuff.create({
    data: payload,
  });

  return newStuff;
}

async function createFull(
  payload: TStuffClient,
  collageId: string
): Promise<User | null> {
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        activeStatus: "regular",
        collageId: collageId,
      },
    });

    // create profile
    const newProfile = await tx.profile.create({
      data: {
        aadharNo: payload.adhaarNo,
        address: payload.address,
        phoneNo: payload.phoneNo,
        userId: newUser.id,
      },
    });

    // create bank
    const newBank = await tx.bankAccount.create({
      data: {
        bankName: payload.bankName,
        accountHolderName: payload.accountHolderName,
        accountNo: payload.accountNo,
        ifscCode: payload.ifscCode,
      },
    });

    // create stuff
    const newStuff = await tx.stuff.create({
      data: {
        highestDegree: payload.highestDegree,
        specializedIn: payload.specializedIn,
        profileId: newProfile.id,
        bankAccountId: newBank.id,
      },
    });

    return newUser;
  });

  return result;
}

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

// export
export default {
  create,
  createFull,
  findByUserId,
};
