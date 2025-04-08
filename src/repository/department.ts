// internal import
import prisma from "../lib/prisma";

// types import
import { Department, DeptType } from "@prisma/client";
import { IDeprtInfo } from "../service/collage";

async function create(
  collageId: string,
  department: IDeprtInfo
): Promise<Department> {
  const newDepartment = prisma.department.create({
    data: {
      type: department.type,
      collageId: collageId,
    },
  });

  return newDepartment;
}

async function findAllByCollageId(
  id: string,
  includeDegree: boolean
): Promise<Department[] | null> {
  const departments = await prisma.department.findMany({
    where: {
      collageId: id,
    },
    include: { degree: includeDegree },
  });

  return departments;
}

async function findByTypeAndCollageId(
  deprtType: DeptType,
  collageId: string
): Promise<Department | null> {
  const department = await prisma.department.findFirst({
    where: {
      type: deprtType,
      collageId: collageId,
    },
  });

  return department;
}

async function findByIdWithFilter(
  deprtId: string,
  field?: keyof Department,
  value?: string
): Promise<Department | null> {
  const whereClause: any = {
    id: deprtId,
  };

  if (field && value !== undefined) {
    whereClause[field] = value;
  }

  const department = await prisma.department.findFirst({
    where: whereClause,
  });

  return department;
}

// export
export default {
  create,
  findByTypeAndCollageId,
  findAllByCollageId,
  findByIdWithFilter,
};
