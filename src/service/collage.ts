// internal import
import collageRepository from "../repository/collage";

// types import
import { Collage } from "@prisma/client";
import { ICollageUpdate } from "../types";
import { CustomError } from "../lib/error";

async function updateCollage(
  data: ICollageUpdate,
  collageId: string
): Promise<Collage | null> {
  try {
    const updatedCollage = await collageRepository.update(data, collageId);
    if (!updateCollage) {
      throw new CustomError("collage update failed", 500);
    }
    return updatedCollage;
  } catch (error) {
    console.log("Error updating collage", error);
    return null;
  }
}

// export
export default {
  updateCollage,
};
