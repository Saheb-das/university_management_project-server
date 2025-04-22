import { Result } from "@prisma/client";
import prisma from "../lib/prisma";

type TSubject = {
  id: string;
  name: string;
  marks: number;
};

export type TResult = {
  batchId: string;
  examId: string;
  semesterId: string;
  studentId: string;
  subjects: TSubject[];
};

async function create(payload: TResult): Promise<Result[] | null> {
  const results = await prisma.$transaction(async (tx) => {
    let resultArr: Result[] = [];

    for (const sub of payload.subjects) {
      // create single result
      const newResult = await tx.result.create({
        data: {
          marks: sub.marks,
          batchId: payload.batchId,
          examId: payload.examId,
          semesterId: payload.semesterId,
          studentId: payload.studentId,
          subjectId: sub.id,
        },
      });

      if (!newResult) {
        throw new Error("result creation failed");
      }

      resultArr.push(newResult);
    }

    return resultArr;
  });

  return results;
}

async function findAllByStudentIdAndSemNo(
  studentId: string,
  semNo: number
): Promise<Result[] | null> {
  const results = await prisma.result.findMany({
    where: {
      studentId: studentId,
      semester: {
        semNo: semNo,
      },
    },
    include: {
      semester: {
        select: {
          id: true,
          semNo: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      exam: {
        select: {
          id: true,
          type: true,
        },
      },
    },
  });

  return results;
}

// export
export default {
  create,
  findAllByStudentIdAndSemNo,
};
