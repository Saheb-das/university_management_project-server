// internal import
import { CustomError } from "../lib/error";
import userService, { RoleOpt } from "../service/user";
import {
  changePasswordSchema,
  stuffRoleSchema,
  stuffSchema,
  TStuffClient,
  TStuffRole,
  TUpdateStudentInput,
  TUpdateStuffInput,
  updateStudentUserSchema,
  updateStuffUserSchema,
} from "../zod/user";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { UserRole } from "@prisma/client";

async function createUser(
  req: AuthRequest<TStuffClient>,
  res: Response,
  next: NextFunction
) {
  const userInfo = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const isValid = stuffSchema.safeParse(userInfo);
    if (!isValid.success) {
      console.log(isValid.error.message);

      throw new CustomError("invalid input", 400, isValid.error);
    }

    const newUser = await userService.createUser(userInfo, collageId);
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

async function getUsers(
  req: AuthRequest<{}, {}, { role: TStuffRole }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { role } = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const isValidRole = stuffRoleSchema.safeParse(role);
    if (!isValidRole.success) {
      throw new CustomError("invalid role", 400);
    }

    const users = await userService.getAllUsers(role, collageId);
    if (!users) {
      throw new CustomError("users not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      users: users,
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(
  req: AuthRequest<{}, { id: string }, { role: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { role } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const defaultRole: RoleOpt = {
      student: false,
      stuff: false,
    };

    const studentRole = role === "student";
    const stuffRole = role === "stuff";

    const user = await userService.getUser(id, {
      ...defaultRole,
      student: studentRole,
      stuff: stuffRole,
    });
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      user: user,
    });
  } catch (error) {
    next(error);
  }
}

async function getTeacherUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const teacherUsers = await userService.getAllTeacherUsers(collageId);
    if (!teacherUsers) {
      throw new CustomError("users not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      teachers: teacherUsers,
    });
  } catch (error) {
    next(error);
  }
}

type UpdateUserInput = TUpdateStuffInput | TUpdateStudentInput;

async function updateUser(
  req: AuthRequest<UpdateUserInput, { id: string }, { role: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const updateData = req.body;
  const { id } = req.params;
  const { role } = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!id) {
      throw new CustomError("user id params required", 400);
    }

    let updatedUser: any = null;
    if (role === "student") {
      const isValid = updateStudentUserSchema.safeParse(updateData);
      if (!isValid.success) {
        throw new CustomError("invalid input", 400, isValid.error);
      }

      updatedUser = await userService.updateStudentUser(
        id,
        updateData as TUpdateStudentInput
      );
      if (!updatedUser) {
        throw new CustomError("user not updated", 500);
      }
    } else {
      const isValid = updateStuffUserSchema.safeParse(updateData);
      if (!isValid.success) {
        throw new CustomError("invalid input", 400, isValid.error);
      }

      updatedUser = await userService.updateStuffUser(
        id,
        updateData as TUpdateStuffInput
      );
      if (!updatedUser) {
        throw new CustomError("user not updated", 500);
      }
    }

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      updatedUser: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export interface IChangePassword {
  oldPass: string;
  newPass: string;
  confirmNewPass: string;
}
async function updateUserPassword(
  req: AuthRequest<IChangePassword, { id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const userId = req.authUser.id;
    const collageId = req.authUser.collageId;

    if (userId !== id) {
      throw new CustomError("invalid id params", 400);
    }

    const isValid = changePasswordSchema.safeParse(req.body);
    if (!isValid.success) {
      throw new CustomError("invalid input", 400, isValid.error);
    }

    const changedPassword = await userService.changePassword(
      userId,
      collageId,
      isValid.data
    );
    if (!changedPassword) {
      throw new CustomError("password not changed", 500);
    }

    res.status(200).json({
      success: true,
      message: "password update successfully",
      changedPassword: !!changedPassword,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(
  req: AuthRequest<{ newStatus: string }, { id: string }, { role: UserRole }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { newStatus } = req.body;
  const { role } = req.query;
  const { id } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const updatedStatus = await userService.updateUserStatus(
      id,
      role,
      newStatus
    );
    if (!updatedStatus) {
      throw new CustomError("user status not updated", 500);
    }

    res.status(200).json({
      success: true,
      message: "status updated successfully",
      user: updatedStatus,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser() {}

// export
export default {
  createUser,
  getUsers,
  getUser,
  getTeacherUsers,
  updateUser,
  updateUserPassword,
  updateUserStatus,
  deleteUser,
};
