// internal import
import prisma from "../lib/prisma";
import { getYearRange } from "../utils/range";

// types import
import { DepartmentStudentStats, DeptType } from "@prisma/client";

async function findAllByYear(
  collageId: string,
  year: string
): Promise<DepartmentStudentStats[] | null> {
  const studentStats = await prisma.departmentStudentStats.findMany({
    where: {
      collageId: collageId,
      year: Number(year),
    },
  });

  return studentStats;
}

export type TStudentsByDepartment = {
  departmentId: string;
  departmentType: DeptType | undefined;
  students: number;
};
async function findAllGroupByDept(
  collageId: string
): Promise<TStudentsByDepartment[] | null> {
  const studentsByDepartment = await prisma.departmentStudentStats.groupBy({
    by: ["departmentId"],
    where: {
      collageId: collageId,
    },
    _sum: {
      students: true,
    },
    orderBy: {
      departmentId: "asc",
    },
  });

  // Extract department IDs
  const departmentIds = studentsByDepartment.map((item) => item.departmentId);

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
  const resultWithNames = studentsByDepartment.map((stat) => {
    const dept = departments.find((d) => d.id === stat.departmentId);
    return {
      departmentId: stat.departmentId,
      departmentType: dept?.type,
      students: stat._sum.students ?? 0,
    };
  });

  return resultWithNames;
}

async function findByDeptId(
  collageId: string,
  deptId: string,
  year?: string
): Promise<DepartmentStudentStats[] | null> {
  const studentStats = await prisma.departmentStudentStats.findMany({
    where: {
      collageId: collageId,
      departmentId: deptId,
      year: Number(year) || new Date().getFullYear(),
    },
  });

  return studentStats;
}

async function findTotalCountByYear(collageId: string, year?: string) {
  const totalStudents = await prisma.departmentStudentStats.aggregate({
    _sum: {
      students: true,
    },
    where: {
      year: Number(year) || new Date().getFullYear(),
      collageId: collageId,
    },
  });

  return totalStudents;
}

export type StudentsByYear = {
  year: number;
  _sum: {
    students: number | null;
  };
};
async function findTotalCountByYearRange(
  collageId: string
): Promise<StudentsByYear[] | null> {
  const endYear = new Date().getFullYear();
  const startYear = endYear - 5;

  const yearRange = getYearRange(Number(startYear), Number(endYear));

  const studentsByYear = await prisma.departmentStudentStats.groupBy({
    by: ["year"],
    where: {
      year: {
        in: yearRange,
      },
      collageId: collageId,
    },
    _sum: {
      students: true,
    },
    orderBy: {
      year: "asc",
    },
  });

  return studentsByYear;
}

// export
export default {
  findAllGroupByDept,
  findTotalCountByYearRange,
};
