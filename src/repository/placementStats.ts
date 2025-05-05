import { DeptType } from "@prisma/client";
import prisma from "../lib/prisma";

type TPlacement = {
  departmentId: string;
  departmentName: DeptType | undefined;
  eligible: number;
  placed: number;
};

async function findAllPlacementsGroupByDept(
  collageId: string,
  year?: string
): Promise<TPlacement[] | null> {
  const placementStats = await prisma.placementStats.groupBy({
    by: ["departmentId"],
    where: {
      year: Number(year) || new Date().getFullYear(),
      collageId: collageId,
    },
    _sum: {
      eligible: true,
      placed: true,
    },
    orderBy: {
      departmentId: "asc",
    },
  });

  // find departments
  const departments = await prisma.department.findMany({
    where: {
      id: {
        in: placementStats.map((p) => p.departmentId),
      },
    },
    select: {
      id: true,
      type: true,
    },
  });

  const merged = placementStats.map((p) => {
    const dept = departments.find((d) => d.id === p.departmentId);
    return {
      departmentId: p.departmentId,
      departmentName: dept?.type,
      eligible: p._sum.eligible ?? 0,
      placed: p._sum.placed ?? 0,
    };
  });

  return merged;
}

// export
export default {
  findAllPlacementsGroupByDept,
};
