// external import
import { CustomError } from "../lib/error";
import subjectRepository from "../repository/subject";
import semesterRepository from "../repository/semester";

// internal import
import { Prisma, Subject } from "@prisma/client";
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

async function getAllSubjectsBySemesterId(
  semId: string
): Promise<Subject[] | null> {
  try {
    if (!semId) {
      throw new CustomError("semester id required", 400);
    }

    const isExist = await semesterRepository.findById(semId);
    if (!isExist) {
      throw new CustomError("semester not found", 404);
    }

    const subjects = await subjectRepository.findAllBySemesterId(isExist.id);
    if (!subjects) {
      throw new CustomError("subjects not found", 404);
    }

    return subjects;
  } catch (error) {
    console.log("Error fetching subjects", error);
    return null;
  }
}

// export
export default {
  createSubjects,
  getAllSubjectsBySemesterId,
};
