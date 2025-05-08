// internal import
import { CustomError } from "../lib/error";
import studentStatsRepository, {
  StudentsByYear,
} from "../repository/studentStats";
import collageRepository from "../repository/collage";
import teacherStatsRepository from "../repository/teacherStat";
import placementStatsRepository, {
  TPlacement,
} from "../repository/placementStats";
import satisfyRepository from "../repository/satisfyStats";
import revenueRepository from "../repository/revenue";
import stuffStatsRepository from "../repository/stuffStats";

// types import
import { TStudentsByDepartment } from "../repository/studentStats";
import { TSatisfyRate } from "../repository/satisfyStats";
import { TTeacherByDepartment } from "../repository/teacherStat";
import { StuffRoleStats } from "@prisma/client";

async function getAllStudentStatsByDept(
  collageId: string
): Promise<TStudentsByDepartment[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const studentStats = await studentStatsRepository.findAllGroupByDept(
      collageId
    );
    if (!studentStats) {
      throw new CustomError("student stats not found", 404);
    }

    return studentStats;
  } catch (error) {
    console.log("Error fetching student stats", error);
    return null;
  }
}

async function getAllTeacherStatsByDept(
  collageId: string
): Promise<TTeacherByDepartment[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const teacherStats = await teacherStatsRepository.findAllGroupByDept(
      collageId
    );
    if (!teacherStats) {
      throw new CustomError("teacher stats not found", 404);
    }

    return teacherStats;
  } catch (error) {
    console.log("Error fetching teacher stats", error);
    return null;
  }
}

async function getGrowthByYearRange(
  collageId: string
): Promise<StudentsByYear[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const growthStats = await studentStatsRepository.findTotalCountByYearRange(
      collage.id
    );
    if (!growthStats) {
      throw new CustomError("growth stats not found", 404);
    }

    return growthStats;
  } catch (error) {
    console.log("Error fetching growth stats", error);
    return null;
  }
}

async function getPlacementGroupByDept(
  collageId: string
): Promise<TPlacement[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const placementStats =
      await placementStatsRepository.findAllPlacementsGroupByDept(collageId);
    if (!placementStats) {
      throw new CustomError("placement stats not found", 404);
    }

    return placementStats;
  } catch (error) {
    console.log("Error fetching placement stats", error);
    return null;
  }
}

async function getRevenueByYear(collageId: string, year?: string) {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const yearlyRevenue = await revenueRepository.findRevenueByYear(
      collage.id,
      year
    );
    if (!yearlyRevenue) {
      throw new CustomError("revenue not found", 404);
    }

    return yearlyRevenue;
  } catch (error) {
    console.log("Error fetching revenue stats", error);
    return null;
  }
}

async function getSatisfyStatsByStudent(collageId: string, year?: string) {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const satisfyStats = await satisfyRepository.findAllReviewGroupByScore(
      collage.id,
      year
    );
    if (!satisfyStats) {
      throw new CustomError("satisfy stats not found", 404);
    }

    return satisfyStats;
  } catch (error) {
    console.log("Error fetching satisfy stats", error);
    return null;
  }
}

async function getSatisfyRateByPrevAndCurrYear(
  collageId: string
): Promise<TSatisfyRate[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const satisfyRate = await satisfyRepository.findSatisfationRate(collage.id);
    if (!satisfyRate) {
      throw new CustomError("satisfy rate not found", 404);
    }

    return satisfyRate;
  } catch (error) {
    console.log("Error fetching satisfy stats", error);
    return null;
  }
}

async function getStuffStats(
  collageId: string
): Promise<StuffRoleStats[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const stuffStats = await stuffStatsRepository.findAllStuffStats(collage.id);
    if (!stuffStats) {
      throw new CustomError("stuff stats not found", 404);
    }

    return stuffStats;
  } catch (error) {
    console.log("Error fetching stuff stats", error);
    return null;
  }
}

// export
export default {
  getAllStudentStatsByDept,
  getAllTeacherStatsByDept,
  getGrowthByYearRange,
  getPlacementGroupByDept,
  getSatisfyStatsByStudent,
  getSatisfyRateByPrevAndCurrYear,
  getRevenueByYear,
  getStuffStats,
};
