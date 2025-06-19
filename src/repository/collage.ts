// internal import
import prisma from "../lib/prisma";

// types import
import { Collage, Prisma } from "@prisma/client";
import { ICollage, ICollageUpdate } from "../types/collage";

async function create(payload: ICollage): Promise<Collage | null> {
  const newCollage = await prisma.collage.create({
    data: {
      name: payload.name,
      address: payload.address,
      established: payload.established,
      registrationNo: payload.registrationNo,
      programs: payload.programs,
      bankAccountId: payload.bankAccountId,
    },
  });

  return newCollage;
}

export type TCollage = Prisma.CollageGetPayload<{
  select: {
    name: true;
    id: true;
  };
}>;
async function findAll(): Promise<TCollage[] | []> {
  const collages = await prisma.collage.findMany({
    select: {
      name: true,
      id: true,
    },
  });

  return collages;
}

async function findById(collageId: string): Promise<Collage | null> {
  const collage = await prisma.collage.findUnique({
    where: {
      id: collageId,
    },
    include: {
      departments: {
        select: {
          id: true,
          type: true,
        },
      },
      collageEnrollmentStats: true,
    },
  });

  return collage;
}

async function update(
  payload: Partial<ICollageUpdate>,
  id: string
): Promise<Collage | null> {
  try {
    const updatePayload: any = {}; // Prepare the update object dynamically

    if (payload.approvedBy !== undefined) {
      updatePayload.approvedBy = payload.approvedBy;
    }

    if (payload.ranking !== undefined) {
      updatePayload.ranking = payload.ranking;
    }

    if (payload.campusSize !== undefined) {
      updatePayload.campusSize = payload.campusSize;
    }

    if (payload.programs !== undefined) {
      updatePayload.programs = { set: payload.programs }; // Only update if provided
    }

    const updatedCollage = await prisma.collage.update({
      where: { id: id },
      data: updatePayload, // Update only existing fields
    });

    return updatedCollage;
  } catch (error) {
    console.error("Error updating collage:", error);
    return null;
  }
}

// export
export default {
  create,
  findById,
  findAll,
  update,
};
