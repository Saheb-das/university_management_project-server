// internal import
import prisma from "../lib/prisma";

// types import
import { StuffRoleStats } from "@prisma/client";

async function findAllStuffStats(
  collageId: string
): Promise<StuffRoleStats[] | null> {
  const stuffStats = await prisma.stuffRoleStats.findMany({
    where: {
      collageId: collageId,
    },
  });

  return stuffStats;
}

// export
export default {
  findAllStuffStats,
};
