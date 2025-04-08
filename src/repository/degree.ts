import { Degree, DegreeType } from "@prisma/client";
import prisma from "../lib/prisma";

async function create(
  deprtId: string,
  dType: DegreeType
): Promise<Degree | null> {
  const newDegree = await prisma.degree.create({
    data: {
      type: dType,
      departmentId: deprtId,
    },
  });

  return newDegree;
}

async function findByTypeAndDeprtId(
  dType: DegreeType,
  deprtId: string
): Promise<Degree | null> {
  const degree = await prisma.degree.findFirst({
    where: {
      type: dType,
      departmentId: deprtId,
    },
  });

  return degree;
}

async function findByIdWithFilter(
  degreeId: string,
  field?: keyof Degree,
  value?: string
): Promise<Degree | null> {
  const whereClause: any = {
    id: degreeId,
  };

  if (field && value !== undefined) {
    whereClause[field] = value;
  }

  const degree = await prisma.degree.findFirst({
    where: whereClause,
  });

  return degree;
}

// export
export default {
  findByTypeAndDeprtId,
  findByIdWithFilter,
  create,
};
