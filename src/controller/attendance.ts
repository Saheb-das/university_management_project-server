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

async function getAttendances() {}
async function getAttendance() {}
async function updateAttendance() {}
async function deleteAttendance() {}

// export
export default {
  createAttendance,
  getAttendances,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};
