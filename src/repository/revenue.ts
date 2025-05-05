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

// export
export default {
  findRevenueByYear,
};
