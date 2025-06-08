// internal import
import prisma from "../lib/prisma";

// types import
import { IStudentFilter, IStudentIdentifier } from "../controller/student";
import { ActiveStatus, Prisma, Student } from "@prisma/client";

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

async function findAllByBatchId(batchId: string): Promise<Student[] | null> {
  const students = await prisma.student.findMany({
    where: {
      batchId: batchId,
    },
    include: {
      profile: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      department: {
        select: {
          id: true,
          type: true,
        },
      },
      course: {
        select: {
          id: true,
          name: true,
          degree: {
            select: {
              id: true,
              type: true,
            },
          },
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

export type StudentWithBatch = Prisma.StudentGetPayload<{
  include: {
    batch: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
async function findByUserId(userId: string): Promise<StudentWithBatch | null> {
  const student = await prisma.student.findFirst({
    where: {
      profile: {
        userId: userId,
      },
    },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return student;
}

export type StudentWithAcademicDetails = Prisma.StudentGetPayload<{
  include: {
    profile:{
     select:{
      user: true
     }
    },
    department: {
      select: {
        type: true;
      };
    };
    batch: {
      select: {
        name: true;
      };
    };
    course: {
      select: {
        name: true;
      };
    };
    currentSemester: {
      include: {
        semester: {
          select: {
            semNo: true;
          };
        };
      };
    };
  };
}>;
async function findByUserIdIncludeAcademicDetails(
  userId: string
): Promise<StudentWithAcademicDetails | null> {
  const studentUser = await prisma.student.findFirst({
    where: {
      profile: {
        userId: userId,
      },
    },
    include: {
      profile: {
        select:{
          user:true
        }
      },
      department: {
        select: {
          type: true,
        },
      },
      batch: {
        select: {
          name: true,
        },
      },
      course: {
        select: {
          name: true,
        },
      },
      currentSemester: {
        include: {
          semester: {
            select: {
              semNo: true,
            },
          },
        },
      },
    },
  });

  return studentUser;
}

export type TStudentUpdateStatus = Prisma.StudentGetPayload<{
  include: {
    profile: {
      select: {
        user: true;
      };
    };
  };
}>;
async function updateStatus(
  id: string,
  newStatus: ActiveStatus
): Promise<TStudentUpdateStatus | null> {
  const updatedStudent = await prisma.student.update({
    where: {
      id: id,
    },
    data: {
      profile: {
        update: {
          user: {
            update: {
              activeStatus: newStatus,
            },
          },
        },
      },
    },
    include: {
      profile: {
        select: {
          user: true,
        },
      },
    },
  });

  return updatedStudent;
}

async function updateRollAndReg(
  studentId: string,
  data: IStudentIdentifier
): Promise<Student | null> {
  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { rollNo: data.rollNo, registretionNo: data.regNo },
  });

  return updated;
}

// export
export default {
  findAll,
  findById,
  findAllByBatchId,
  findByUserId,
  updateStatus,
  updateRollAndReg,
  findByUserIdIncludeAcademicDetails,
};
