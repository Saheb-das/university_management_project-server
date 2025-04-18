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

async function findAll(collageId: string): Promise<Batch[] | null> {
  const batches = await prisma.batch.findMany({
    where: {
      department: {
        collageId: collageId,
      },
    },
  });

  return batches;
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

async function findById(batchId: string): Promise<Batch | null> {
  const batch = await prisma.batch.findUnique({
    where: {
      id: batchId,
    },
  });

  return batch;
}

async function findByIdAndSemId(
  id: string,
  semId: string
): Promise<Batch | null> {
  const batch = await prisma.batch.findUnique({
    where: {
      id: id,
      course: {
        semesters: {
          some: {
            id: semId,
          },
        },
      },
    },
  });

  return batch;
}

export type BatchWithSemesters = Prisma.BatchGetPayload<{
  include: {
    course: {
      select: {
        semesters: true;
      };
    };
  };
}>;

async function findByIdWithSemesters(
  batchId: string
): Promise<BatchWithSemesters | null> {
  const batchWithSems = await prisma.batch.findFirst({
    where: {
      id: batchId,
    },
    include: {
      course: {
        select: {
          semesters: true,
        },
      },
    },
  });

  return batchWithSems;
}

// export
export default {
  create,
  findByName,
  findById,
  findByIdAndSemId,
  findByIdWithSemesters,
  findAll,
};
