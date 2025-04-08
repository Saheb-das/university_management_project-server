// internal import
import prisma from "../lib/prisma";

// types import
import { User } from "@prisma/client";
import { TStudentClient } from "../zod/user";
import { IIds } from "../service/user";

async function create(
  payload: TStudentClient,
  collageId: string,
  idsPayload: IIds,
  userId: string,
  commissionIncome: string
): Promise<User | null> {
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
    });

    return newUser;
  });

  return result;
}

// export
export default {
  create,
};
