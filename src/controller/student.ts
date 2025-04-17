// internal import
import { CustomError } from "../lib/error";
import studentService from "../service/student";
import { studentSearchFilter } from "../lib/filter";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { ActiveStatus } from "@prisma/client";
import { statusSchema } from "../zod/user";

export interface IStudentFilter {
  deprt?: string;
  deg?: string;
  year?: string;
}

async function getStudents(
  req: AuthRequest<{}, {}, IStudentFilter>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const studentFilter = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isValidFilter = studentSearchFilter(studentFilter);
    if (!isValidFilter) {
      throw new CustomError("either three field required nor no field", 400);
    }

    const students = await studentService.getAllStudents(studentFilter);
    if (!students) {
      throw new CustomError("students not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "students fetched successfully",
      students: students,
    });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(
  req: AuthRequest<{ status: ActiveStatus }, { id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { status } = req.body;
  const { id } = req.params;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const isValidStatus = statusSchema.safeParse(status);
    if (!isValidStatus.success) {
      throw new CustomError("invalid status", 400);
    }

    const updateStudent = await studentService.changeActiveStatus(
      id,
      isValidStatus.data
    );
    if (!updateStudent) {
      throw new CustomError("student not updated", 500);
    }

    res.status(200).json({
      success: true,
      message: "students updated successfully",
      updatedStudent: updateStudent,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  getStudents,
  changeStatus,
};
