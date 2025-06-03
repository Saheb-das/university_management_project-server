// internal import
import { CustomError } from "../lib/error";
import resultService from "../service/result";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { resultSchema } from "../zod/result";

interface ISubject {
  id: string;
  name: string;
  marks: number;
}

export interface IResult {
  studentId: string;
  semesterId: string;
  subjects: ISubject[];
  examId: string;
}

async function createResult(
  req: AuthRequest<IResult>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isValid = resultSchema.safeParse(req.body);
    if (!isValid.success) {
      throw new CustomError("invalid input", 400, isValid.error);
    }

    const newResult = await resultService.createResult(isValid.data);
    if (!newResult) {
      throw new CustomError("result not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "result created successfully",
      results: newResult,
    });
  } catch (error) {
    next(error);
  }
}

async function getResultByStudentIdAndSem(
  req: AuthRequest<{}, { studentId: string }, { sem: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { studentId } = req.params;
  const { sem } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    if (!studentId) {
      throw new CustomError("student id required", 400);
    }

    if (!sem) {
      throw new CustomError("sem no required", 400);
    }

    const result = await resultService.getResultByStudentId(studentId, sem);
    if (!result) {
      throw new CustomError("result not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "result fetched successfully",
      result: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getResultByStudentExamSem(
  req: AuthRequest<
    {},
    { studentId: string; examId: string },
    { semId: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { studentId, examId } = req.params;
  const { semId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    if (!studentId || !examId) {
      throw new CustomError("student id and examId required", 400);
    }

    if (!semId) {
      throw new CustomError("sem no required", 400);
    }

    const result = await resultService.getResultByStudentExamSem(
      studentId,
      examId,
      semId
    );
    if (!result) {
      throw new CustomError("result not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "result fetched successfully",
      results: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateResult() {}

// export
export default {
  createResult,
  getResultByStudentIdAndSem,
  updateResult,
  getResultByStudentExamSem,
};
