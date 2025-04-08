// internal import
import studentRepository from "../repository/student";
import stuffRepository from "../repository/stuff";
import batchRepository from "../repository/batch";
import degreeRepository from "../repository/degree";
import admissionRepository from "../repository/admission";
import { CustomError } from "../lib/error";
import { genHashedPassword } from "../lib/password";

// types import
import { ActiveStatus, User, UserRole } from "@prisma/client";
import { TStudentClient, TStuffClient } from "../zod/user";
import { calcCommission } from "../utils/commission";
import { TAdmission } from "../repository/admission";

export interface IBaseUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  activeStatus: ActiveStatus;
  aadharNo: string;
  address: string;
  phoneNo: string;
}

export interface IIds {
  departmentId: string;
  courseId: string;
  batchId: string;
  degreeId: string;
}

async function createStudentUser(
  payload: TStudentClient,
  collageId: string,
  userId: string
): Promise<User | null> {
  try {
    const hashedPassword = await genHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new CustomError("password not hashed", 500);
    }

    const stuff = await stuffRepository.findByUserId(userId);
    if (!stuff) {
      throw new CustomError("stuff not found", 404);
    }

    const isExistBatch = await batchRepository.findByName(payload.batch, {
      includeDepartment: true,
      includeCourse: true,
    });
    if (!isExistBatch) {
      throw new CustomError(`${payload.batch} batch not found`, 404);
    }

    if (!isExistBatch.department) {
      throw new CustomError("department not retrive", 404);
    }

    if (!isExistBatch.course) {
      throw new CustomError("course not retrive", 404);
    }

    const isExistDegree = await degreeRepository.findByIdWithFilter(
      isExistBatch.course.degreeId
    );
    if (!isExistDegree) {
      throw new CustomError("degree not found", 404);
    }

    const commissionIncome = calcCommission({
      courseName: isExistBatch.course.name,
      degreeType: isExistDegree.type,
      departmentType: isExistBatch.department.type,
      role: "stuff",
    });

    const studentPayload: TStudentClient = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      adhaarNo: payload.adhaarNo,
      address: payload.address,
      phoneNo: payload.phoneNo,
      dob: payload.dob,
      guardianName: payload.guardianName,
      relWithGuardian: payload.relWithGuardian,
      admissionYear: payload.admissionYear,
      gradeAtSec: payload.gradeAtSec,
      gradeAtHigherSec: payload.gradeAtHigherSec,
      batch: payload.batch,
    };

    const idsPayload: IIds = {
      departmentId: isExistBatch.departmentId,
      courseId: isExistBatch.courseId,
      batchId: isExistBatch.id,
      degreeId: isExistBatch.course.degreeId,
    };

    const newStudent = await studentRepository.create(
      studentPayload,
      collageId,
      idsPayload,
      stuff.id,
      commissionIncome
    );
    if (!newStudent) {
      throw new CustomError("student not created", 500);
    }

    return newStudent;
  } catch (error) {
    console.log("Error create student user", error);
    return null;
  }
}

async function createStuffUser(payload: TStuffClient, collageId: string) {
  try {
    const hashedPassword = await genHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new CustomError("password not hashed", 500);
    }

    const stuffPayload: TStuffClient = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      adhaarNo: payload.adhaarNo,
      address: payload.address,
      phoneNo: payload.phoneNo,
      highestDegree: payload.highestDegree,
      specializedIn: payload.specializedIn,
      bankName: payload.bankName,
      accountNo: payload.accountNo,
      ifscCode: payload.ifscCode,
      accountHolderName: payload.accountHolderName,
    };

    const newStuff = await stuffRepository.createFull(stuffPayload, collageId);
    if (!newStuff) {
      throw new CustomError("stuff not created", 500);
    }

    return newStuff;
  } catch (error) {
    console.log("Error create stuff user", 500);
    return null;
  }
}

// export
export default {
  createStudentUser,
  createStuffUser,
};
