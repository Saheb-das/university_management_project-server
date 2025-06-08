// internal import
import prisma from "../lib/prisma";

// types import
import { AsignTeacher, Prisma } from "@prisma/client";

export interface IAsign {
  teacherId: string;
  departmentId: string;
  batchId: string;
  semesterId: string;
  subjectId: string;
}

async function create(payload: IAsign): Promise<AsignTeacher | null> {
  const result = await prisma.$transaction(async (tx) => {
    // create new asign-teacher
    const newAsign = await tx.asignTeacher.create({
      data: {
        teacherId: payload.teacherId,
        departmentId: payload.departmentId,
        batchId: payload.batchId,
        semesterId: payload.semesterId,
        subjectId: payload.subjectId,
      },
    });

    // update lecture with asign-teacher
    const updateLecture = await tx.lecture.updateMany({
      where: {
        subjectId: payload.subjectId,
      },
      data: {
        asignTeacherId: newAsign.id,
      },
    });

    const teacherUser = await tx.user.findFirst({
      where: {
        profile: {
          stuff: {
            id: payload.teacherId,
          },
        },
      },
    });

    if (!teacherUser) {
      throw new Error("teacher user not found");
    }

    // update or create teacher stats in department
    const teacherStat = await tx.departmentTeacherStats.upsert({
      where: {
        collageId_departmentId_year: {
          collageId: teacherUser.collageId,
          departmentId: newAsign.departmentId,
          year: teacherUser.createdAt.getFullYear(),
        },
      },
      update: {
        teachers: {
          increment: 1,
        },
      },
      create: {
        teachers: 1,
        year: teacherUser.createdAt.getFullYear(),
        collageId: teacherUser.collageId,
        departmentId: payload.departmentId,
      },
    });

    return newAsign;
  });

  return result;
}

async function findAllSubjectsByTeacherId(
  teacherId: string
): Promise<AsignTeacher[] | null> {
  const subjects = await prisma.asignTeacher.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return subjects;
}

export type AsignTeacherWithBatch = Prisma.AsignTeacherGetPayload<{
  include: {
    batch: {
      select: {
        id: true;
        name: true;
      };
    };
    semester: {
      select: {
        id: true;
        semNo: true;
      };
    };
  };
}>;

async function findAllByTeacherId(
  teacherId: string
): Promise<AsignTeacherWithBatch[] | null> {
  const asignedTeachers = await prisma.asignTeacher.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
      semester: {
        select: {
          id: true,
          semNo: true,
        },
      },
    },
  });

  return asignedTeachers;
}

type RemovedAsignTeacher = Prisma.AsignTeacherGetPayload<{
  include: {
    batch: {
      select: {
        name: true;
      };
    };
  };
}>;
async function remove(
  teacherId: string,
  subjectId: string
): Promise<RemovedAsignTeacher | null> {
  const result = await prisma.$transaction(async (tx) => {
    const obj = await tx.asignTeacher.findFirst({
      where: {
        teacherId: teacherId,
        subjectId: subjectId,
      },
    });

    if (!obj) {
      return null;
    }

    const removedItem = await tx.asignTeacher.delete({
      where: {
        id: obj.id,
      },
      include: {
        batch: {
          select: {
            name: true,
          },
        },
      },
    });

    return removedItem;
  });

  return result;
}

export type TeachersWithSub = Prisma.AsignTeacherGetPayload<{
  include: {
    teacher: {
      select: {
        profile: {
          select: {
            avatar: true;
            user: {
              select: {
                email: true;
                firstName: true;
                lastName: true;
              };
            };
          };
        };
      };
    };
    subject: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
async function findAllTeachersBybatchAndSemId(
  batchId: string,
  semId: string
): Promise<TeachersWithSub[] | null> {
  const asignedTeachers = await prisma.asignTeacher.findMany({
    where: {
      batchId: batchId,
      semesterId: semId,
    },
    include: {
      teacher: {
        select: {
          profile: {
            select: {
              avatar: true,
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return asignedTeachers;
}

// export
export default {
  create,
  findAllSubjectsByTeacherId,
  findAllByTeacherId,
  findAllTeachersBybatchAndSemId,
  remove,
};
