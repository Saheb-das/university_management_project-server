// internal import
import studentRepository from "../repository/student";
import examRepository from "../repository/exam";
import semesterRepository from "../repository/semester";
import subjectRepository from "../repository/subject";
import resultRepository from "../repository/result";
import { CustomError } from "../lib/error";

// types import
import { Result } from "@prisma/client";
import { IResult } from "../controller/result";
import { TResult } from "../repository/result";

async function createResult(resultInfo: IResult): Promise<Result[] | null> {
  try {
    const student = await studentRepository.findById(resultInfo.studentId);
    if (!student) {
      throw new CustomError("student not found", 404);
    }

    const exam = await examRepository.findById(resultInfo.examId);
    if (!exam) {
      throw new CustomError("exam not found");
    }

    const semester = await semesterRepository.findById(resultInfo.semesterId);
    if (!semester) {
      throw new CustomError("semester not found", 404);
    }

    const subjects = await subjectRepository.findAllBySemesterId(semester.id);
    if (!subjects) {
      throw new CustomError("subjects not found", 404);
    }

    let isPresent: boolean = true;
    for (const sub of subjects) {
      isPresent = false;
      for (const subInfo of resultInfo.subjects) {
        if (subInfo.id === sub.id) {
          isPresent = true;
        }
      }
      if (!isPresent) {
        break;
      }
    }
    if (!isPresent) {
      throw new CustomError("invalid subject", 400);
    }

    const resultPayload: TResult = {
      studentId: student.id,
      batchId: student.batchId,
      examId: exam.id,
      semesterId: semester.id,
      subjects: resultInfo.subjects,
    };

    const newResults = await resultRepository.create(resultPayload);
    if (!newResults) {
      throw new CustomError("new results not create", 500);
    }

    return newResults;
  } catch (error) {
    console.log("Error create result", error);
    return null;
  }
}

async function getResultByStudentId(
  studentId: string,
  semNo: string
): Promise<Result[] | null> {
  try {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new CustomError("student not found", 404);
    }

    const results = await resultRepository.findAllByStudentIdAndSemNo(
      studentId,
      Number(semNo)
    );
    if (!results) {
      throw new CustomError("results not found", 404);
    }

    return results;
  } catch (error) {
    console.log("Error fetching result", error);
    return null;
  }
}

// export
export default {
  createResult,
  getResultByStudentId,
};
