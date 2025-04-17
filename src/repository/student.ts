// internal import
import prisma from "../lib/prisma";

// types import
import { IStudentFilter } from "../controller/student";
import { Prisma, Student } from "@prisma/client";

async function findAll(filter: IStudentFilter): Promise<Student[] | null> {
  const whereClause =
    filter && filter.deg && filter.deprt && filter.year
      ? {
          departmentId: filter.deprt,
          course: {
            degreeId: filter.deg,
          },
          admissionYear: filter.year,
        }
      : {};

  const students = await prisma.student.findMany({
    where: whereClause,
    include: {
      profile: {
        include: {
          user: true,
        },
      },
    },
  });
  return students;
}

type StudentWithProfileUser = Prisma.StudentGetPayload<{
  include: {
    profile: {
      include: {
        user: true;
      };
    };
  };
}>;

async function findById(id: string): Promise<StudentWithProfileUser | null> {
  const student = await prisma.student.findUnique({
    where: {
      id: id,
    },
    include: {
      profile: {
        include: {
          user: true,
        },
      },
    },
  });

  return student;
}

// export
export default {
  findAll,
  findById,
};
