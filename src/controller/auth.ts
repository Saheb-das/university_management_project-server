// internal import
import { CustomError } from "../lib/error";
import authService from "../service/auth";

// types import
import { Request, Response, NextFunction } from "express";
import { TCollageClient } from "../zod/collage";
import { TBankClient } from "../zod/bank";
import { loginSchema, TLoginClient } from "../zod/auth";
import { TStuffClient } from "../zod/user";

async function register(
  req: Request<
    {},
    {},
    {
      user: TStuffClient;
      collage: TCollageClient;
      collageBankDetails: TBankClient;
    }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { user, collage, collageBankDetails } = req.body;

  try {
    if (!user) {
      throw new CustomError("register user date required", 400);
    }

    if (!collage) {
      throw new CustomError("register collage date required", 400);
    }

    if (!collageBankDetails) {
      throw new CustomError("register collage date required", 400);
    }

    const newUser = await authService.register(
      user,
      collage,
      collageBankDetails
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

    const accessToken = await authService.login(isValidData.data);
    if (!accessToken) {
      throw new CustomError("user not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "login successfully",
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  register,
  login,
};
