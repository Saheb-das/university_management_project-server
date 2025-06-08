// internal import
import prisma from "../lib/prisma";

// types import
import { Admission, Prisma } from "@prisma/client";
import { IIds } from "../service/admission";
import { TStudentClient } from "../zod/user";

export type TAdmission = Omit<Admission, "createdAt" | "updatedAt" | "id">;

type AdmissionWithUser = Prisma.AdmissionGetPayload<{
  include: {
    student: {
      select: {
        profile: {
          select: {
            userId: true;
          };
        };
      };
    };
  };
}>;

async function create(
  payload: TStudentClient,
  collageId: string,
  idsPayload: IIds,
  userId: string,
  commissionIncome: string
): Promise<AdmissionWithUser | null> {
  const result = await prisma.$transaction(async (tx) => {
    // create user
    const newUser = await tx.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        activeStatus: "regular",
        collageId: collageId,
      },
    });

    // create profile
    const newProfile = await tx.profile.create({
      data: {
        aadharNo: payload.adhaarNo,
        address: payload.address,
        phoneNo: payload.phoneNo,
        userId: newUser.id,
      },
    });

    // create student
    const newStudent = await tx.student.create({
      data: {
        dob: payload.dob,
        admissionYear: payload.admissionYear,
        gradeAtHigherSec: payload.gradeAtHigherSec,
        gradeAtSec: payload.gradeAtSec,
        guardianName: payload.guardianName,
        relWithGuardian: payload.relWithGuardian,
        batchId: idsPayload.batchId,
        departmentId: idsPayload.departmentId,
        courseId: idsPayload.courseId,
        profileId: newProfile.id,
      },
    });

    // find semester
    const sem1 = await tx.semester.findFirst({
      where: {
        courseId: newStudent.courseId,
        semNo: 1,
      },
    });
    if (!sem1) {
      throw Error("semesters not found");
    }

    // create admission
    const newAdmission = await tx.admission.create({
      data: {
        commission: commissionIncome,
        inYear: Number(payload.admissionYear),
        courseId: idsPayload.courseId,
        departmentId: idsPayload.departmentId,
        studentId: newStudent.id,
        degreeId: idsPayload.degreeId,
        counsellorId: userId,
      },
      include: {
        student: {
          select: {
            profile: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    // current semester set
    const curSem = await tx.currentSemester.create({
      data: {
        studentId: newStudent.id,
        batchId: newStudent.batchId,
        semesterId: sem1.id,
      },
    });

    // update student stats by department
    const studentStat = await tx.departmentStudentStats.upsert({
      where: {
        collageId_departmentId_degreeId_year: {
          collageId: collageId,
          departmentId: newAdmission.departmentId,
          degreeId: newAdmission.degreeId,
          year: newAdmission.inYear,
        },
      },
      update: {
        students: {
          increment: 1,
        },
      },
      create: {
        year: newAdmission.inYear,
        students: 1,
        departmentId: newAdmission.departmentId,
        degreeId: newAdmission.degreeId,
        collageId: collageId,
      },
    });

    // update graduation stats
    const graduateStat = tx.graduationStats.upsert({
      where: {
        collageId_departmentId_degreeId_year: {
          collageId: collageId,
          departmentId: newAdmission.departmentId,
          degreeId: newAdmission.degreeId,
          year: newAdmission.inYear,
        },
      },
      update: {
        appeared: {
          increment: 1,
        },
      },
      create: {
        appeared: 1,
        graduated: 0,
        year: newAdmission.inYear,
        departmentId: newAdmission.departmentId,
        degreeId: newAdmission.degreeId,
        collageId: collageId,
      },
    });

    const newEnrollment = await tx.collageEnrollmentStats.upsert({
      where: {
        collageId: newUser.collageId,
      },
      update: {
        totalStudents: {
          increment: 1,
        },
      },
      create: {
        collageId: newUser.collageId,
        totalTeacher: 0,
        totalStudents: 1,
      },
    });

    return newAdmission;
  });

  return result;
}

export type TAdmissionWithDetails = Prisma.AdmissionGetPayload<{
  include: {
    student: {
      select: {
        profile: {
          select: {
            user: {
              select: {
                firstName: true;
                lastName: true;
              };
            };
          };
        };
      };
    };
    degree: {
      select: {
        type: true;
        id: true;
      };
    };
    department: {
      select: {
        type: true;
        id: true;
      };
    };
    course: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
async function findAllByStuffId(
  stuffId: string
): Promise<TAdmissionWithDetails[] | null> {
  const admissions = await prisma.admission.findMany({
    where: stuffId ? { counsellorId: stuffId } : undefined,
    include: {
      student: {
        select: {
          profile: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      degree: {
        select: {
          type: true,
          id: true,
        },
      },
      department: {
        select: {
          type: true,
          id: true,
        },
      },
      course: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return admissions;
}

export type TAdmissionWithCommission = {
  count: number;
  sum: {
    commission: number | null;
  } | null;
};
async function findTotalAdmissionAndCommission(
  stuffId: string
): Promise<TAdmissionWithCommission | null> {
  const data = await prisma.admission.aggregate({
    where: { counsellorId: stuffId },
    _count: true,
    _sum: { commission: true },
  });

  return {
    count: data._count,
    sum: {
      commission: data._sum?.commission ? Number(data._sum.commission) : null,
    },
  };
}

export type TAdmissionStats = {
  year: number;
  totalAdmissions: number;
  totalCommission: string;
};
async function findLastFiveYearStats(
  stuffId: string
): Promise<TAdmissionStats[] | null> {
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 4; // includes current year, so 5 years total

  const stats = await prisma.admission.groupBy({
    by: ["inYear"],
    where: {
      counsellorId: stuffId,
      inYear: {
        gte: fromYear,
        lte: currentYear,
      },
    },
    _count: {
      id: true, // total admissions
    },
    _sum: {
      commission: true, // total commission
    },
    orderBy: {
      inYear: "asc",
    },
  });

  const formattedStats = stats.map((entry) => ({
    year: entry.inYear,
    totalAdmissions: entry._count.id,
    totalCommission: entry._sum.commission?.toString() || "0",
  }));

  return formattedStats;
}

export type TLastYearTopper = {
  counsellorId: string;
  name: string;
  totalAdmissions: number;
  totalCommission: string;
};
async function findTopThreeInLastYear(
  collageId: string
): Promise<TLastYearTopper[] | null> {
  // get previous year
  const lastYear = new Date().getFullYear() - 1;

  // get 3 top consellors
  const topCounsellors = await prisma.admission.groupBy({
    by: ["counsellorId"],
    where: {
      inYear: lastYear,
      department: {
        collageId: collageId,
      },
    },
    _count: {
      id: true, // total admissions
    },
    _sum: {
      commission: true, // total commission
    },
    orderBy: [
      {
        _sum: {
          commission: "desc",
        },
      },
    ],
    take: 3,
  });

  // get together all id's of counsellor
  const counsellorIds = topCounsellors.map((c) => c.counsellorId);

  // fetch require details
  const counsellorDetails = await prisma.stuff.findMany({
    where: {
      id: { in: counsellorIds },
    },
    select: {
      id: true,
      profile: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // merge all details
  const result = topCounsellors.map((entry) => {
    const info = counsellorDetails.find((c) => c.id === entry.counsellorId);

    return {
      counsellorId: entry.counsellorId,
      name: `${info?.profile.user.firstName} ${info?.profile.user.lastName}`,
      totalAdmissions: entry._count.id,
      totalCommission: entry._sum.commission!.toString(),
    };
  });

  return result;
}

export default {
  findAllByStuffId,
  findTotalAdmissionAndCommission,
  findLastFiveYearStats,
  findTopThreeInLastYear,
  create,
};
