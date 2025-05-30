// internal import
import prisma from "../lib/prisma";

// types import
import { RevenueStats } from "@prisma/client";

async function findRevenueByYear(
  collageId: string,
  year?: string
): Promise<RevenueStats[] | null> {
  const currentYear = new Date().getFullYear();
  const yearlyRevenue = await prisma.revenueStats.findMany({
    where: {
      year: Number(year) || currentYear,
      collageId: collageId,
    },
  });

  return yearlyRevenue;
}

async function findLastFiveYearsRevenue(
  collageId: string
): Promise<RevenueStats[] | null> {
  const yearlyRevenue = await prisma.revenueStats.findMany({
    where: {
      collageId: collageId,
    },
    orderBy: {
      year: "desc", // Most recent year first
    },
    take: 5, // Limit to the latest 5 years
  });

  return yearlyRevenue.sort((a, b) => a.year - b.year);
}

// export
export default {
  findRevenueByYear,
  findLastFiveYearsRevenue,
};
