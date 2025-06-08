// internal import
import { CustomError } from "../lib/error";
import attendanceService from "../service/attendance";

// types import
import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

export interface IAttendanceQuery {
  semester: string;
  subject: string;
  batch: string;
}

export interface IAttendanceStudents {
  [key: string]: boolean;
}

async function createAttendance(
  req: AuthRequest<IAttendanceStudents, {}, IAttendanceQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const studentList = req.body;
  const { batch, semester, subject } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!semester || !batch || !subject) {
      throw new CustomError(
        "semester id, batch id and subject id required",
        400
      );
    }

    const newAttendances = await attendanceService.createAttendance(
      req.query,
      studentList
    );
    if (!newAttendances) {
      throw new CustomError("attendanced not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "attendance create successfully",
      newAttendances: newAttendances,
    });
  } catch (error) {
    next(error);
  }
}

async function getAttendanceCountByStudentId(
  req: AuthRequest<
    {},
    { studentId: string },
    { batchId: string; semId: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { studentId } = req.params;
  const { batchId, semId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!studentId) {
      throw new CustomError("student id required", 400);
    }

    if (!batchId || !semId) {
      throw new CustomError("batch id and sem id required", 400);
    }

    const attendanceCount = await attendanceService.getAttendanceCount({
      studentId,
      batchId,
      semesterId: semId,
    });
    if (!attendanceCount) {
      throw new CustomError("attendanced not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "attendance fetched successfully",
      attendanceCount: attendanceCount,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createAttendance,
  getAttendanceCountByStudentId,
};
