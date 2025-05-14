// internal import
import prisma from "../lib/prisma";
import user, { RoleOpt } from "../service/user";

// types import
import { ActiveStatus, Prisma, User, UserRole } from "@prisma/client";
import {
  TStuffClient,
  TStuffRole,
  TUpdateStudentInput,
  TUpdateStuffInput,
} from "../zod/user";

async function create(
  payload: TStuffClient,
  collageId: string
): Promise<User | null> {
  const result = await prisma.$transaction(async (tx) => {
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

    // create bank
    const newBank = await tx.bankAccount.create({
      data: {
        bankName: payload.bankName,
        accountHolderName: payload.accountHolderName,
        accountNo: payload.accountNo,
        ifscCode: payload.ifscCode,
      },
    });

    // create stuff
    const newStuff = await tx.stuff.create({
      data: {
        highestDegree: payload.highestDegree,
        specializedIn: payload.specializedIn,
        profileId: newProfile.id,
        bankAccountId: newBank.id,
      },
    });

    // add in stats
    const stuffStat = await tx.stuffRoleStats.upsert({
      where: {
        collageId_role: {
          // replace with your actual @@unique constraint name
          collageId: collageId,
          role: newUser.role,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        role: newUser.role,
        count: 1,
        collageId: collageId,
      },
    });

    if (newUser.role === "teacher") {
      const newEnrollment = await tx.collageEnrollmentStats.upsert({
        where: {
          collageId: newUser.collageId,
        },
        update: {
          totalTeacher: {
            increment: 1,
          },
        },
        create: {
          collageId: newUser.collageId,
          totalTeacher: 1,
          totalStudents: 0,
        },
      });
    }

    return newUser;
  });

  return result;
}

async function findById(
  id: string,
  collageId: string = ""
): Promise<User | null> {
  const whereCluase = collageId ? { id, collageId } : { id };

  const user = await prisma.user.findUnique({
    where: whereCluase,
  });

  return user;
}

type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: true;
  };
}>;

async function findByIdWithDetails(
  userId: string,
  roleOpt: RoleOpt
): Promise<UserWithProfile | null> {
  let profileInclude: any;
  if (roleOpt.student) {
    profileInclude = { profile: { include: { student: true } } };
  } else if (roleOpt.stuff) {
    profileInclude = { profile: { include: { stuff: true } } };
  } else {
    profileInclude = { profile: true };
  }

  const userWithDetails = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      ...profileInclude,
    },
  });

  return userWithDetails;
}

async function findByEmailAndRole(
  email: string,
  role: UserRole
): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      role: role,
    },
  });
  return user;
}

async function findAll(
  role: TStuffRole,
  collageId: string
): Promise<User[] | null> {
  const users = await prisma.user.findMany({
    where: {
      role: role,
      collageId: collageId,
    },
    include: {
      profile: {
        include: {
          stuff: true,
        },
      },
    },
  });

  return users;
}

async function findAllTeachers(collageId: string): Promise<User[] | null> {
  const teachers = await prisma.user.findMany({
    where: {
      role: "teacher",
      collageId: collageId,
    },
    include: {
      profile: {
        select: {
          stuff: {
            select: {
              id: true,
              highestDegree: true,
              asignTeachers: {
                select: {
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
                  lectures: {
                    select: {
                      subject: true,
                    },
                  },
                  semester: {
                    select: {
                      semNo: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return teachers;
}

async function updateStudent(
  userId: string,
  payload: TUpdateStudentInput
): Promise<User | null> {
  const userPayload = { ...(payload.email ? { email: payload.email } : {}) };
  const profilePayload = {
    ...(payload.address ? { address: payload.address } : {}),
    ...(payload.phoneNo ? { phoneNo: payload.phoneNo } : {}),
  };
  const studentPayload = {
    ...(payload.registretionNo
      ? { registretionNo: payload.registretionNo }
      : {}),
    ...(payload.rollNo ? { rollNo: payload.rollNo } : {}),
  };

  const updatedResult = await prisma.$transaction(async (tx) => {
    // update user
    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: userPayload,
    });

    // update profile
    const updatedProfile = await tx.profile.updateMany({
      where: {
        userId: userId,
      },
      data: profilePayload,
    });

    // update student
    const updatedStudent = await tx.student.updateMany({
      where: {
        profile: {
          userId: userId,
        },
      },
      data: studentPayload,
    });

    return updatedUser;
  });

  return updatedResult;
}

async function updateStuff(
  userId: string,
  payload: TUpdateStuffInput
): Promise<User | null> {
  const userPayload = { ...(payload.email ? { email: payload.email } : {}) };
  const profilePayload = {
    ...(payload.address ? { address: payload.address } : {}),
    ...(payload.phoneNo ? { phoneNo: payload.phoneNo } : {}),
  };
  const stuffPayload = {
    ...(payload.highestDegree ? { highestDegree: payload.highestDegree } : {}),
    ...(payload.specialization
      ? { specializedIn: payload.specialization }
      : {}),
  };

  const bankPayload = {
    ...(payload.bankName ? { bankName: payload.bankName } : {}),
    ...(payload.accountNo ? { accountNo: payload.accountNo } : {}),
    ...(payload.ifscCode ? { ifscCode: payload.ifscCode } : {}),
    ...(payload.accountHolderName
      ? { accountHolderName: payload.accountHolderName }
      : {}),
  };

  const updatedResult = await prisma.$transaction(async (tx) => {
    // update user
    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: userPayload,
    });

    // update profile
    const updatedProfile = await tx.profile.updateMany({
      where: {
        userId: userId,
      },
      data: profilePayload,
    });

    // update stuff
    const updatedStuff = await tx.stuff.updateMany({
      where: {
        profile: {
          userId: userId,
        },
      },
      data: stuffPayload,
    });

    // update bank
    const updatedBank = await tx.bankAccount.updateMany({
      where: {
        stuff: {
          profile: {
            userId: userId,
          },
        },
      },
      data: bankPayload,
    });

    return updatedUser;
  });

  return updatedResult;
}

async function updateStatus(
  userId: string,
  role: UserRole,
  status: ActiveStatus
): Promise<User | null> {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
      role: role,
    },
    data: {
      activeStatus: status,
    },
  });

  return updatedUser;
}

async function updatePassword(
  email: string,
  role: UserRole,
  hashedPassword: string
): Promise<User | null> {
  const updatedUser = await prisma.user.update({
    where: {
      email: email,
      role: role,
    },
    data: {
      password: hashedPassword,
    },
  });

  return updatedUser;
}

// export
export default {
  create,
  findById,
  findByIdWithDetails,
  findByEmailAndRole,
  findAllTeachers,
  findAll,
  updateStudent,
  updateStuff,
  updateStatus,
  updatePassword,
};
