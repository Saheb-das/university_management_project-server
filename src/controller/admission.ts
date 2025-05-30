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
  req: AuthRequest<{}, {}, { userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const admissions = await admissionService.getAllAdmissions(userId);
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

async function getAdmissionsAndCommissions(
  req: AuthRequest<{}, { userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const totalAdmitsAndCommission =
      await admissionService.getTotalAdmissionAndCommission(userId);
    if (!totalAdmitsAndCommission) {
      throw new CustomError("admissions and commissions are not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "admissions and commissions fetched successfully",
      totalAdmitsAndComs: totalAdmitsAndCommission,
    });
  } catch (error) {
    next(error);
  }
}

async function getPrevFiveYearsStats(
  req: AuthRequest<{}, { userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const fiveYearsStats = await admissionService.getLastFiveYearsStats(userId);
    if (!fiveYearsStats) {
      throw new CustomError("last five years stats not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "last five years stats fetched successfully",
      fiveYearsStats: fiveYearsStats,
    });
  } catch (error) {
    next(error);
  }
}

async function getTopThreeInPrevYear(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const topThree = await admissionService.getTopThreeInLastYear(collageId);
    if (!topThree) {
      throw new CustomError("top three in previous year not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "top three in previous year fetched successfully",
      topThree: topThree,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createAdmission,
  getAdmissions,
  getAdmissionsAndCommissions,
  getPrevFiveYearsStats,
  getTopThreeInPrevYear,
};
