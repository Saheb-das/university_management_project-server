// internal import
import { CustomError } from "../lib/error";
import examService from "../service/exam";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export interface IExam {
  course: string;
  examTypes: string[];
}

async function createExams(
  req: AuthRequest<IExam>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { course, examTypes } = req.body;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    if (!course) {
      throw new CustomError("degree id required", 404);
    }

    if (examTypes.length <= 0) {
      throw new CustomError("types of exam required", 400);
    }

    const exams = await examService.createExams(req.body);
    if (!exams) {
      throw new CustomError("exams not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "exams create successfully",
      exams: exams,
    });
  } catch (error) {
    next(error);
  }
}

async function getExamsByCourseId(
  req: AuthRequest<{}, { courseId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { courseId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const exams = await examService.getExamsByCourseId(courseId);
    if (!exams) {
      throw new CustomError("exams not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "exams fetchs successfully",
      exams: exams,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createExams,
  getExamsByCourseId,
};
