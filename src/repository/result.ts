import { Prisma, Result } from "@prisma/client";
import prisma from "../lib/prisma";
import exam from "./exam";
import { QueryProps } from "../service/result";

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
      const upsertedResult = await tx.result.upsert({
        where: {
          unique_result_entry: {
            studentId: payload.studentId,
            subjectId: sub.id,
            examId: payload.examId,
            semesterId: payload.semesterId,
          },
        },
        update: {
          marks: sub.marks, // update only marks
        },
        create: {
          marks: sub.marks,
          batchId: payload.batchId,
          examId: payload.examId,
          semesterId: payload.semesterId,
          studentId: payload.studentId,
          subjectId: sub.id,
        },
      });

      resultArr.push(upsertedResult);
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

async function findByStudentExamSemIds(
  studentId: string,
  examId: string,
  semId: string
): Promise<Result[] | null> {
  const results = await prisma.result.findMany({
    where: {
      studentId: studentId,
      examId: examId,
      semesterId: semId,
    },
  });

  return results;
}

export type TResultWithDetails = Prisma.ResultGetPayload<{
  include: {
    semester: {
      select: {
        id: true;
        semNo: true;
      };
    };
    subject: {
      select: {
        id: true;
        name: true;
      };
    };
    exam: {
      select: {
        id: true;
        type: true;
      };
    };
  };
}>;
async function findBySemBatchStudentIds({
  studentId,
  batchId,
  semId,
}: QueryProps): Promise<TResultWithDetails[] | []> {
  const results = await prisma.result.findMany({
    where: {
      studentId: studentId,
      batchId: batchId,
      semesterId: semId,
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
  findByStudentExamSemIds,
  findBySemBatchStudentIds,
};
