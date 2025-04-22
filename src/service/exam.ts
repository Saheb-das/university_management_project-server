// internal import
import { Exam } from "@prisma/client";
import { IExam } from "../controller/exam";
import { CustomError } from "../lib/error";
import courseRepository from "../repository/course";
import examRepository from "../repository/exam";

async function createExams(examPayload: IExam): Promise<Exam[] | null> {
  try {
    const course = await courseRepository.findByIdWithFilter(
      examPayload.course
    );
    if (!course) {
      throw new CustomError("course not found", 404);
    }

    const exams = await examRepository.create(examPayload);
    if (!exams) {
      throw new CustomError("exams not created", 500);
    }

    return exams;
  } catch (error) {
    console.log("Error creating exams", error);
    return null;
  }
}

async function getExamsByCourseId(courseId: string): Promise<Exam[] | null> {
  try {
    const course = await courseRepository.findByIdWithFilter(courseId);
    if (!course) {
      throw new CustomError("course not found", 404);
    }

    const exams = await examRepository.findAllByCourseId(courseId);
    if (!exams) {
      throw new CustomError("exams not found", 404);
    }

    return exams;
  } catch (error) {
    console.log("Error creating exams", error);
    return null;
  }
}

// export
export default {
  createExams,
  getExamsByCourseId,
};
