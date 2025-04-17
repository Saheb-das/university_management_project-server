// internal import
import { CustomError } from "../lib/error";
import admissionService from "../service/admission";
import { studentSchema } from "../zod/user";

// types import
import { Response, NextFunction } from "express";
import { TStudentClient } from "../zod/user";
import { AuthRequest } from "../types";

async function createAdmission(
  req: AuthRequest<TStudentClient>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userInfo = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;
    const userId = req.authUser.id;

    if (!userInfo) {
      throw new CustomError("user data required", 400);
    }

    const isValid = studentSchema.safeParse(userInfo);
    if (!isValid.success) {
      throw new CustomError(isValid.error.message, 400);
    }

    const newAdmission = await admissionService.createAdmission(
      isValid.data,
      collageId,
      userId
    );
    if (!newAdmission) {
      throw new CustomError("user not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "admission created successfully",
      admission: newAdmission,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdmissions(
  req: AuthRequest<{}, {}, { stuffId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { stuffId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const admissions = await admissionService.getAllAdmissions(stuffId);
    if (!admissions) {
      throw new CustomError("admissions not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "admissions fetched successfully",
      admissions: admissions,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createAdmission,
  getAdmissions,
};
