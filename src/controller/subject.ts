// internal import
import { CustomError } from "../lib/error";
import { subjectsSchema } from "../zod/subject";
import subjectService from "../service/subject";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { TSubjectsClient } from "../zod/subject";

async function createSubjects(
  req: AuthRequest<TSubjectsClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const allSubjects = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isValid = subjectsSchema.safeParse(allSubjects);
    if (!isValid.success) {
      console.log("isValid", isValid.success);

      throw new CustomError("invalid data", 400);
    }

    const newSubjects = await subjectService.createSubjects(isValid.data);
    if (!newSubjects) {
      throw new CustomError("course subjects not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "subjects created successfully",
      subjects: newSubjects,
    });
  } catch (error) {
    next(error);
  }
}

async function getSubjectsBySemesterId(
  req: AuthRequest<{}, {}, { sem: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { sem } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!sem) {
      throw new CustomError("semester id required");
    }

    const subjects = await subjectService.getAllSubjectsBySemesterId(sem);
    if (!subjects) {
      throw new CustomError("subjects not found");
    }

    res.status(200).json({
      success: true,
      message: "subjects fetched successfully",
      subjects: subjects,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createSubjects,
  getSubjectsBySemesterId,
};
