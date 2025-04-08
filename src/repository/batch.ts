import { Batch, Prisma, Course, Department } from "@prisma/client";
import prisma from "../lib/prisma";
import { IBatch } from "../service/batch";

type FindByNameOptions = {
  includeDepartment?: boolean;
  includeCourse?: boolean;
};

interface IBatchResult {
  id: string;
  name: string;
  batchYear: number;
  departmentId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  department?: Department;
  course?: Course;
}

async function create(payload: IBatch): Promise<Batch | null> {
  const newBatch = await prisma.batch.create({
    data: {
      name: payload.name,
      batchYear: Number(payload.batchYear),
      departmentId: payload.departmentId,
      courseId: payload.courseId,
    },
  });

  return newBatch;
}

async function findByName(
  batchName: string,
  options?: FindByNameOptions
): Promise<IBatchResult | null> {
  const include: any = {};

  if (options?.includeDepartment) {
    include.department = true;
  }

  if (options?.includeCourse) {
    include.course = true;
  }

  const batch = await prisma.batch.findUnique({
    where: {
      name: batchName,
    },
    include: Object.keys(include).length > 0 ? include : undefined,
  });

  return batch;
}

// export
export default {
  create,
  findByName,
};
