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

export async function createAllWithoutDuplicate(
  departmentId: string,
  degreeTypes: DegreeType[]
) {
  // 1. Fetch existing degree types for the department
  const existingDegrees = await prisma.degree.findMany({
    where: {
      departmentId,
    },
    select: { type: true },
  });

  const existingTypes = new Set(existingDegrees.map((d) => d.type));

  // 2. Filter out degrees that already exist
  const missingDegrees =
    degreeTypes && degreeTypes.filter((type) => !existingTypes.has(type));

  // 3. Create only missing degrees
  if (missingDegrees.length > 0) {
    await prisma.degree.createMany({
      data: missingDegrees.map((type) => ({
        type,
        departmentId,
      })),
    });
  }

  // 4. Return all degrees for that department
  const allDegrees = await prisma.degree.findMany({
    where: {
      departmentId,
    },
    select: {
      id: true,
      type: true,
    },
  });

  return allDegrees;
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

async function findById(degreeId: string): Promise<Degree | null> {
  const degree = await prisma.degree.findUnique({
    where: {
      id: degreeId,
    },
  });

  return degree;
}

// export
export default {
  findByTypeAndDeprtId,
  findByIdWithFilter,
  create,
  findById,
  createAllWithoutDuplicate,
};
