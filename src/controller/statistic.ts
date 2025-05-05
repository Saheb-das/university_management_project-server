// internal import
import { CustomError } from "../lib/error";
import statisticService from "../service/statistic";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { yearSchema } from "../zod/statistic";

async function getStudentStatsByDept(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    const collageId = req.authUser.collageId;

    const studentStats = statisticService.getAllStudentStatsByDept(collageId);
    if (!studentStats) {
      throw new CustomError("student stats not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "student stats find successfully",
      studentStats: studentStats,
    });
  } catch (error) {
    next(error);
  }
}

async function getTeacherStatsByDept(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    const collageId = req.authUser.collageId;

    const teacherStats = await statisticService.getAllTeacherStatsByDept(
      collageId
    );
    if (!teacherStats) {
      throw new CustomError("teacher stats not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "teacher stats find successfully",
      teacherStats: teacherStats,
    });
  } catch (error) {
    next(error);
  }
}

async function getGrowth(
  req: AuthRequest<{}, {}, { sYear: string; eYear: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { eYear, sYear } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    if (!sYear || !eYear) {
      throw new CustomError("sYear and eYear both required", 400);
    }

    const collageId = req.authUser.collageId;

    const collageGrowth = await statisticService.getGrowthByYearRange(
      collageId,
      sYear,
      eYear
    );
    if (!collageGrowth) {
      throw new CustomError("collage growth not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "collage growth stats find successfully",
      growth: collageGrowth,
    });
  } catch (error) {
    next(error);
  }
}

async function getRevenue(
  req: AuthRequest<{}, {}, { year?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { year } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    const collageId = req.authUser.collageId;

    let isYear = "";
    if (year) {
      const isValid = yearSchema.safeParse(Number(year));
      if (!isValid.success) {
        throw new CustomError("invalid year input", 400, isValid.error);
      }

      isYear = String(isValid.data);
    }

    const collageRevenue = await statisticService.getRevenueByYear(
      collageId,
      isYear
    );
    if (!collageRevenue) {
      throw new CustomError("collage revenue not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "collage growth stats find successfully",
      revenue: collageRevenue,
    });
  } catch (error) {
    next(error);
  }
}

async function getPlacementStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    const collageId = req.authUser.collageId;

    const collagePlacements = await statisticService.getPlacementGroupByDept(
      collageId
    );
    if (!collagePlacements) {
      throw new CustomError("collage placement not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "collage growth stats find successfully",
      collagePlacements: collagePlacements,
    });
  } catch (error) {
    next(error);
  }
}

async function getSatisfyStatsByStudent(
  req: AuthRequest<{}, {}, { year: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { year } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    let isYear = "";
    if (year) {
      const isValid = yearSchema.safeParse(Number(year));
      if (!isValid.success) {
        throw new CustomError("invalid year input", 400, isValid.error);
      }

      isYear = String(isValid.data);
    }

    const collageId = req.authUser.collageId;

    const reviewScore = await statisticService.getSatisfyStatsByStudent(
      collageId,
      isYear
    );
    if (!reviewScore) {
      throw new CustomError("review score not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "satisfy stats find successfully",
      satisfyScore: reviewScore,
    });
  } catch (error) {
    next(error);
  }
}

async function getGraduateRateStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }
  } catch (error) {
    next(error);
  }
}

async function getSatisfyRateStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    const collageId = req.authUser.collageId;

    const satisfyRate = await statisticService.getSatisfyRateByPrevAndCurrYear(
      collageId
    );
    if (!satisfyRate) {
      throw new CustomError("satisfy rate ", 404);
    }

    res.status(200).json({
      success: true,
      message: "satisfy rate find successfully",
      satisfyRate: satisfyRate,
    });
  } catch (error) {
    next(error);
  }
}

async function getStuffStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthrized user", 401);
    }

    const collageId = req.authUser.collageId;

    const stuffStats = await statisticService.getStuffStats(collageId);
    if (!stuffStats) {
      throw new CustomError("stuff stats not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "stuff stats find successfully",
      stuffStats: stuffStats,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  getStudentStatsByDept,
  getTeacherStatsByDept,
  getGrowth,
  getRevenue,
  getPlacementStats,
  getGraduateRateStats,
  getSatisfyStatsByStudent,
  getSatisfyRateStats,
  getStuffStats,
};
