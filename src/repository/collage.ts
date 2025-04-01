// internal import
import prisma from "../lib/prisma";

// types import
import { Collage } from "@prisma/client";
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
  update,
};
