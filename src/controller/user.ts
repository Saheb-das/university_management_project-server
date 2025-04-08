// internal import
import { CustomError } from "../lib/error";
import userService from "../service/user";
import {
  studentSchema,
  stuffSchema,
  TStudentClient,
  TStuffClient,
} from "../zod/user";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { User } from "@prisma/client";

type TUserClient = TStudentClient & TStuffClient;

async function createUser(
  req: AuthRequest<TUserClient, {}, { user: string }>,
  res: Response,
  next: NextFunction
) {
  const userInfo = req.body;
  const { user } = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;
    const userId = req.authUser.id;

    if (!userInfo) {
      throw new CustomError("user data required", 400);
    }

    if (!user) {
      throw new CustomError("query params required", 400);
    }

    let newUser: User | null = null;

    if (user === "student") {
      const isValid = studentSchema.safeParse(userInfo);
      if (!isValid.success) {
        throw new CustomError(isValid.error.message, 400);
      }

      newUser = await userService.createStudentUser(
        isValid.data,
        collageId,
        userId
      );
    }

    if (user === "stuff") {
      const isValid = stuffSchema.safeParse(userInfo);
      if (!isValid.success) {
        throw new CustomError(isValid.error.message, 400);
      }

      newUser = await userService.createStuffUser(userInfo, collageId);
    }

    if (!newUser) {
      throw new CustomError("user not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "user created successfully",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
}

async function getUsers() {}

async function getUser() {}

async function getUserProfile() {}

async function updateUser() {}

async function deleteUser() {}

// export
export default {
  createUser,
  getUsers,
  getUser,
  getUserProfile,
  updateUser,
  deleteUser,
};
