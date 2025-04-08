// internal import
import prisma from "../lib/prisma";

// types import
import { Prisma } from "@prisma/client";
import { ISubjects } from "../types/subject";

async function createMany(
  allSubjects: ISubjects
): Promise<Prisma.BatchPayload> {
  const entries = Object.entries(allSubjects).flatMap(([semester, subjects]) =>
    subjects.map((subject) => ({
      name: subject.name,
      subjectCode: subject.code,
      credit: subject.credit,
      semesterId: semester,
    }))
  );

  const courseSubjects = await prisma.subject.createMany({
    data: entries,
    skipDuplicates: true,
  });

  return courseSubjects;
}

// export
export default {
  createMany,
};
