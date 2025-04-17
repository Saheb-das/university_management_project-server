// internal import
import { CustomError } from "../lib/error";
import asignTeacherService from "../service/asign-teacher";

// types import
import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

export interface IAsignTeacher {
  batchName: string;
  semester: string;
  subject: string;
}

async function asignTeacher(
  req: AuthRequest<IAsignTeacher, { teacherId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { batchName, semester, subject } = req.body;
  const { teacherId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!batchName || !semester || !subject) {
      throw new CustomError("invalid input");
    }

    const asignData = req.body;

    const asignTeacher = await asignTeacherService.asignTeacher(
      teacherId,
      asignData
    );
    if (!asignTeacher) {
      throw new CustomError("teacher not asigned", 500);
    }

    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      asigned: asignTeacher,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  asignTeacher,
};
