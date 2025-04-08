// external import
import { CustomError } from "../lib/error";
import subjectRepository from "../repository/subject";

// internal import
import { Prisma } from "@prisma/client";
import { ISubjects } from "../types/subject";

async function createSubjects(
  subjects: ISubjects
): Promise<Prisma.BatchPayload | null> {
  try {
    const newSubjects = await subjectRepository.createMany(subjects);
    if (!newSubjects) {
      throw new CustomError("subjects not created", 500);
    }

    return newSubjects;
  } catch (error) {
    console.log("Error create subjects", error);
    return null;
  }
}

// export
export default {
  createSubjects,
};
