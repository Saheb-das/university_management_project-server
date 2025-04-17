// internal import
import userRepository from "../repository/user";
import { CustomError } from "../lib/error";
import { genHashedPassword } from "../lib/password";
import asignTeacherRepository, { IAsign } from "../repository/asignTeacher";
import batchRepository from "../repository/batch";
import semesterRepository from "../repository/semester";
import subjectRepository from "../repository/subject";

// types import
import { ActiveStatus, AsignTeacher, User, UserRole } from "@prisma/client";
import {
  TStuffClient,
  TStuffRole,
  TUpdateStudentInput,
  TUpdateStuffInput,
} from "../zod/user";

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

async function createUser(
  payload: TStuffClient,
  collageId: string
): Promise<User | null> {
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

    const newUser = await userRepository.create(stuffPayload, collageId);
    if (!newUser) {
      throw new CustomError("user not created", 500);
    }

    return newUser;
  } catch (error) {
    console.log("Error create user", 500);
    return null;
  }
}

export interface RoleOpt {
  student: boolean;
  stuff: boolean;
}

async function getUser(userId: string, roleOpt: RoleOpt): Promise<User | null> {
  try {
    const user = await userRepository.findByIdWithDetails(userId, roleOpt);
    if (!user) {
      throw new CustomError("user not found");
    }

    return user;
  } catch (error) {
    console.log("Error finding user", error);
    return null;
  }
}

async function getAllUsers(
  role: TStuffRole,
  collageId: string
): Promise<User[] | null> {
  try {
    const users = await userRepository.findAll(role, collageId);
    return users;
  } catch (error) {
    console.log("Error fetching users", error);
    return null;
  }
}

async function getAllTeacherUsers(collageId: string): Promise<User[] | null> {
  try {
    if (!collageId) {
      throw new CustomError("collage id required", 500);
    }

    const teachers = await userRepository.findAllTeachers(collageId);
    if (!teachers) {
      throw new CustomError("teachers user not found", 404);
    }

    return teachers;
  } catch (error) {
    console.log("Error fetching teachers", error);
    return null;
  }
}

interface IUpdateUser {
  email?: string;
  address?: string;
  phoneNo?: string;
  profileImg?: string;
  highestDegree?: string;
  specialization?: string;
}

async function updateStuffUser(
  userId: string,
  data: TUpdateStuffInput
): Promise<User | null> {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const updatedUser = await userRepository.updateStuff(user.id, data);
    if (!updatedUser) {
      throw new CustomError("user not updated", 500);
    }

    return updatedUser;
  } catch (error) {
    console.log("Error updating stuff user", error);
    return null;
  }
}

async function updateStudentUser(
  userId: string,
  data: TUpdateStudentInput
): Promise<User | null> {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const updatedUser = await userRepository.updateStudent(user.id, data);
    if (!updatedUser) {
      throw new CustomError("user not updated", 500);
    }

    return updatedUser;
  } catch (error) {
    console.log("Error updating student user", error);
    return null;
  }
}

// export
export default {
  createUser,
  getUser,
  getAllUsers,
  getAllTeacherUsers,
  updateStuffUser,
  updateStudentUser,
};
