import { Semester } from "@prisma/client";
import prisma from "../lib/prisma";

interface ISemeter {
  semesterNo: number;
  courseId: string;
}

/**
 * Creates a new semester entry in the database.
 *
 * @param semesterInfo - An object containing the semester number and course ID.
 * @returns A Promise that resolves to the newly created Semester object, or null if creation fails.
 *
 * @example
 * const newSem = await create({ semesterNo: 4, courseId: 'course-abc' });
 * console.log(newSem); // { id: 'sem-xyz', semNo: 4, courseId: 'course-abc' }
 */
async function create(semesterInfo: ISemeter): Promise<Semester | null> {
  const newSemester = await prisma.semester.create({
    data: {
      semNo: semesterInfo.semesterNo,
      courseId: semesterInfo.courseId,
    },
  });

  return newSemester;
}

/**
 * Retrieves all semesters associated with a specific batch ID.
 *
 * This function queries the database for semesters whose related course
 * includes the specified batch. It's useful for determining which semesters
 * belong to a given batch through the course-to-batch relationship.
 *
 * @param batchId - The unique identifier of the batch.
 * @returns A Promise that resolves to an array of Semester objects, or null if none are found.
 *
 * @example
 * const semesters = await findAllByBatchId("batch-2025");
 * console.log(semesters); // [{ id: 'sem-1', semNo: 1, ... }, { id: 'sem-2', semNo: 2, ... }]
 */
async function findAllByBatchId(batchId: string): Promise<Semester[] | null> {
  const semesters = await prisma.semester.findMany({
    where: {
      course: {
        batches: {
          some: {
            id: batchId,
          },
        },
      },
    },
  });

  return semesters;
}

async function findById(semId: string): Promise<Semester | null> {
  const semester = await prisma.semester.findUnique({
    where: {
      id: semId,
    },
  });

  return semester;
}

// export
export default {
  create,
  findAllByBatchId,
  findById,
};
