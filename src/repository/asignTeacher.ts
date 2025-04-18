// internal import
import prisma from "../lib/prisma";

// types import
import { AsignTeacher } from "@prisma/client";

export interface IAsign {
  teacherId: string;
  departmentId: string;
  batchId: string;
  semesterId: string;
  subjectId: string;
}

async function create(payload: IAsign): Promise<AsignTeacher | null> {
  const result = await prisma.$transaction(async (tx) => {
    // create new asign-teacher
    const newAsign = await tx.asignTeacher.create({
      data: {
        teacherId: payload.teacherId,
        departmentId: payload.departmentId,
        batchId: payload.batchId,
        semesterId: payload.semesterId,
        subjectId: payload.subjectId,
      },
    });

    // update lecture with asign-teacher
    const updateLecture = await tx.lecture.updateMany({
      where: {
        subjectId: payload.subjectId,
      },
      data: {
        asignTeacherId: newAsign.id,
      },
    });

    return newAsign;
  });

  return result;
}

async function findAllSubjectsByTeacherId(
  teacherId: string
): Promise<AsignTeacher[] | null> {
  const subjects = await prisma.asignTeacher.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return subjects;
}

async function remove(
  teacherId: string,
  subjectId: string
): Promise<AsignTeacher | null> {
  const result = await prisma.$transaction(async (tx) => {
    const obj = await tx.asignTeacher.findFirst({
      where: {
        teacherId: teacherId,
        subjectId: subjectId,
      },
    });

    if (!obj) {
      return null;
    }

    const removedItem = await tx.asignTeacher.delete({
      where: {
        id: obj.id,
      },
    });

    return removedItem;
  });

  return result;
}

// export
export default {
  create,
  findAllSubjectsByTeacherId,
  remove,
};
