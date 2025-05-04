// internal import
import { CustomError } from "../lib/error";
import authService from "../service/auth";

// types import
import { Request, Response, NextFunction } from "express";
import { collageSchema, TCollageClient } from "../zod/collage";
import { bankSchema, TBankClient } from "../zod/bank";
import { loginSchema, passwordValidation, TLoginClient } from "../zod/auth";
import { stuffSchema, TStuffClient } from "../zod/user";

interface IRegister {
  user: TStuffClient;
  collage: TCollageClient;
  collageBankDetails: TBankClient;
}
async function register(
  req: Request<{}, {}, IRegister>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { user, collage, collageBankDetails } = req.body;

  try {
    const isValidUser = stuffSchema.safeParse(user);
    if (!isValidUser.success) {
      throw new CustomError("invalid user input", 400, isValidUser.error);
    }

    const isValidCollage = collageSchema.safeParse(collage);
    if (!isValidCollage.success) {
      throw new CustomError("invalid collage input", 400, isValidCollage.error);
    }

    const isValidBank = bankSchema.safeParse(collageBankDetails);
    if (!isValidBank.success) {
      throw new CustomError(
        "invalid collage bank input",
        400,
        isValidBank.error
      );
    }

    const newUser = await authService.register(
      isValidUser.data,
      isValidCollage.data,
      isValidBank.data
    );
    if (!newUser) {
      throw new CustomError("user register failed");
    }

    res.status(200).json({
      success: true,
      message: "user register successfully",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
}

async function login(
  req: Request<{}, {}, { data: TLoginClient }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const data = req.body;

  try {
    if (!data) {
      throw new CustomError("data required", 400);
    }

    const isValidData = loginSchema.safeParse(data);
    if (!isValidData.success) {
      throw new CustomError("invalid credential", 400);
    }

    const userWithToken = await authService.login(isValidData.data);
    if (!userWithToken) {
      throw new CustomError("user not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "login successfully",
      token: userWithToken.accessToken,
      user: userWithToken.user,
    });
  } catch (error) {
    next(error);
  }
}

export interface IForgotPassword {
  email: string;
  role: string;
}
async function forgotPassword(
  req: Request<{}, {}, IForgotPassword>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, role } = req.body;
  try {
    if (!email || !role) {
      throw new CustomError("email and role required", 400);
    }

    const isConfirm = await authService.forgotPassword(req.body);
    if (!isConfirm) {
      throw new CustomError("");
    }

    res.status(200).json({
      success: true,
      message: "email send successfully",
    });
  } catch (error) {
    next(error);
  }
}

interface IVerifyOTP extends IForgotPassword {
  enteredOTP: string;
}
async function verifyOTP(
  req: Request<{}, {}, IVerifyOTP>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, role, enteredOTP } = req.body;
  try {
    if (!email || !role || !enteredOTP) {
      throw new CustomError("email, role and otp required", 400);
    }

    const isVerified = await authService.verifyOTP({ email, role }, enteredOTP);
    if (!isVerified) {
      throw new CustomError("otp not verified", 500);
    }

    res.status(200).json({
      success: true,
      message: "otp verify successfully",
    });
  } catch (error) {
    next(error);
  }
}

interface IResetPassword extends IForgotPassword {
  newPassword: string;
}
async function resetPassword(
  req: Request<{}, {}, IResetPassword>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, role, newPassword } = req.body;
  try {
    if (!email || !role || !newPassword) {
      throw new CustomError("email, role and otp required", 400);
    }

    const isValid = passwordValidation.safeParse(newPassword);
    if (!isValid.success) {
      throw new CustomError("enter valid password", 400);
    }

    const isVerified = await authService.resetPassword(
      { email, role },
      isValid.data
    );
    if (!isVerified) {
      throw new CustomError("password not reset", 500);
    }

    res.status(200).json({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
