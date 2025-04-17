// internal import
import prisma from "../lib/prisma";

// types import
import { Prisma, Subject } from "@prisma/client";
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

async function findAllBySemesterId(semId: string): Promise<Subject[] | null> {
  const subjects = await prisma.subject.findMany({
    where: {
      semesterId: semId,
    },
  });

  return subjects;
}

async function findById(subjectId: string): Promise<Subject | null> {
  const subject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  return subject;
}

// export
export default {
  createMany,
  findAllBySemesterId,
  findById,
};
