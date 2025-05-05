// internal import
import prisma from "../lib/prisma";

// types import
import { DeptType } from "@prisma/client";

async function findByYear(collageId: string, deptId: string, year: string) {}

export type TTeacherByDepartment = {
  departmentId: string;
  departmentType: DeptType | undefined;
  teachers: number;
};
async function findAllGroupByDept(
  collageId: string
): Promise<TTeacherByDepartment[] | null> {
  const teachersByDepartment = await prisma.departmentTeacherStats.groupBy({
    by: ["departmentId"],
    where: {
      collageId: collageId,
    },
    _sum: {
      teachers: true,
    },
    orderBy: {
      departmentId: "asc",
    },
  });

  // Extract department IDs
  const departmentIds = teachersByDepartment.map((item) => item.departmentId);

  // Fetch department names
  const departments = await prisma.department.findMany({
    where: {
      id: { in: departmentIds },
    },
    select: {
      id: true,
      type: true,
    },
  });

  // Merge names into your result
  const resultWithNames = teachersByDepartment.map((stat) => {
    const dept = departments.find((d) => d.id === stat.departmentId);
    return {
      departmentId: stat.departmentId,
      departmentType: dept?.type,
      teachers: stat._sum.teachers ?? 0,
    };
  });

  return resultWithNames;
}

async function findCountByDept(collageId: string, deptId: string) {}

async function findTotalCount(collageId: string) {}

// export
export default {
  findAllGroupByDept,
};
