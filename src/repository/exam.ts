import { Exam } from "@prisma/client";
import prisma from "../lib/prisma";
import { IExam } from "../controller/exam";

async function findById(examId: string): Promise<Exam | null> {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  return exam;
}

async function create(payload: IExam): Promise<Exam[] | null> {
  const examsResult = await prisma.$transaction(async (tx) => {
    let examArr: Exam[] = [];
    for (const et of payload.examTypes) {
      // create exam
      const exam = await tx.exam.create({
        data: {
          type: et,
          courseId: payload.course,
        },
      });

      if (!exam) {
        throw new Error("exam creation failed");
      }

      examArr.push(exam);
    }

    return examArr;
  });

  return examsResult;
}

async function findAllByCourseId(courseId: string): Promise<Exam[] | null> {
  const exams = await prisma.exam.findMany({
    where: {
      courseId: courseId,
    },
  });

  return exams;
}

// export
export default {
  findById,
  findAllByCourseId,
  create,
};
