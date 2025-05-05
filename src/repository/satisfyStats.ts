// internal import
import prisma from "../lib/prisma";

// types import
import { ReviewScore } from "@prisma/client";

export type TSatisfationSurvey = {
  score: ReviewScore;
  _count: { score: number };
};

async function findAllReviewGroupByScore(
  collageId: string,
  year?: string
): Promise<TSatisfationSurvey[] | null> {
  const result = await prisma.satisfactionSurvey.groupBy({
    by: ["score"],
    where: {
      collageId: collageId,
      year: Number(year) || new Date().getFullYear(),
    },
    _count: {
      score: true,
    },
  });

  return result;
}

export type TSatisfyRate = {
  year: number;
  score: ReviewScore;
  _count: { score: number };
};

async function findSatisfationRate(
  collageId: string
): Promise<TSatisfyRate[] | null> {
  const currentYear = new Date().getFullYear();

  const satisfyRate = await prisma.satisfactionSurvey.groupBy({
    by: ["year", "score"],
    where: {
      year: {
        in: [currentYear - 1, currentYear],
      },
      collageId: collageId,
    },
    _count: {
      score: true,
    },
  });

  return satisfyRate;
}

// export
export default {
  findAllReviewGroupByScore,
  findSatisfationRate,
};
