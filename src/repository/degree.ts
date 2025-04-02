import { Degree, DegreeType } from "@prisma/client";
import prisma from "../lib/prisma";
import { IDeprtInfo } from "../service/collage";

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

// export
export default {
  findByTypeAndDeprtId,
  create,
};
