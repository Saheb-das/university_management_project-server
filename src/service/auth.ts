// internal import
import collageRepository from "../repository/collage";
import bankRepository from "../repository/bank";
import userRepository from "../repository/user";
import { compareHashedPassword, genHashedPassword } from "../lib/password";
import { CustomError } from "../lib/error";
import { genJwtAccessToken } from "../lib/jwtToken";
import { generateOTP } from "../utils/genRandom";
import emailService from "../lib/email";
import cache from "../cache/nodeCache";
import conversationRespoitory from "../repository/conversation";

// types import
import { TLoginClient } from "../zod/auth";
import { TCollageClient } from "../zod/collage";
import { TBankClient } from "../zod/bank";
import { IBank, ICollage } from "../types";
import { User, UserRole } from "@prisma/client";
import { TStuffClient } from "../zod/user";
import { IForgotPassword } from "../controller/auth";
import { IConversation } from "../repository/conversation";

async function register(
  userDate: TStuffClient,
  collageDate: TCollageClient,
  collageBankDetails: TBankClient
): Promise<User | null> {
  try {
    if (!userDate) {
      throw new CustomError("user data requried", 400);
    }

    if (!collageDate) {
      throw new CustomError("collage data requried", 400);
    }

    if (!collageBankDetails) {
      throw new CustomError("collage bank details required", 400);
    }

    const bankPayload: IBank = {
      bankName: collageBankDetails.bankName,
      ifscCode: collageBankDetails.ifscCode,
      accountNo: collageBankDetails.accountNo,
      accountHolderName: collageBankDetails.accountHolderName,
    };

    const newCollageBank = await bankRepository.create(bankPayload);
    if (!newCollageBank) {
      throw new CustomError("bank not created", 500);
    }

    const collagePayload: ICollage = {
      name: collageDate.name,
      address: collageDate.address,
      registrationNo: collageDate.registrationNo,
      established: collageDate.established,
      programs: [],
      bankAccountId: newCollageBank.id,
    };

    const newCollage = await collageRepository.create(collagePayload);
    if (!newCollage) {
      throw new CustomError("collage not created", 500);
    }

    const hashedPassword = await genHashedPassword(userDate.password);
    if (!hashedPassword) {
      throw new CustomError("password not hashed", 500);
    }

    const userPayload: TStuffClient = {
      firstName: userDate.firstName,
      lastName: userDate.lastName,
      email: userDate.email,
      password: hashedPassword,
      role: userDate.role,
      adhaarNo: userDate.adhaarNo,
      address: userDate.address,
      phoneNo: userDate.phoneNo,
      bankName: userDate.bankName,
      accountNo: userDate.accountNo,
      ifscCode: userDate.ifscCode,
      accountHolderName: userDate.accountHolderName,
      highestDegree: userDate.highestDegree,
      specializedIn: userDate.specializedIn,
    };

    const newUser = await userRepository.create(userPayload, newCollage.id);
    if (!newUser) {
      throw new CustomError("user not created", 500);
    }

    // conversation create
    if (newUser.role !== "superadmin") {
      throw new CustomError("role should be superadmin");
    }

    const conPayload: IConversation = {
      conName: "announcement",
      collageId: newUser.collageId,
    };

    // announcement conversation create
    const newAnnouncementConversation = await conversationRespoitory.create(
      conPayload
    );
    if (!newAnnouncementConversation) {
      throw new CustomError("announcement conversation not created", 500);
    }

    return newUser;
  } catch (error) {
    console.log("Error in register", error);
    return null;
  }
}

interface ILogin {
  accessToken: string;
  user: {
    id: string;
    role: UserRole;
    email: string;
    collageId: string;
  };
}
async function login(data: TLoginClient): Promise<ILogin | null> {
  try {
    if (!data) {
      throw new CustomError("data required", 500);
    }

    const user = await userRepository.findByEmailAndRole(data.email, data.role);
    if (!user) {
      throw new CustomError("Invalid Credentials", 401);
    }

    const isValidPass = await compareHashedPassword(
      data.password,
      user.password
    );
    if (!isValidPass) {
      throw new CustomError("Inavalid Credentials");
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      collageId: user.collageId,
    };
    const accessToken = genJwtAccessToken(tokenPayload);
    if (!accessToken) {
      throw new CustomError("access token not generated", 500);
    }

    return {
      accessToken,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        collageId: user.collageId,
      },
    };
  } catch (error) {
    console.log("Error in login", error);
    return null;
  }
}

async function forgotPassword(info: IForgotPassword): Promise<string | null> {
  try {
    const user = await userRepository.findByEmailAndRole(
      info.email,
      info.role as UserRole
    );
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const otp = generateOTP({ digit: 6 });

    // cache otp
    const otpCached = cache.set(`${user.email}_${user.role}`, otp, 10 * 60);
    if (!otpCached) {
      throw new CustomError("otp not cached", 500);
    }

    // send mail
    const sendMail = await emailService.sendOTP(user.email, otp);
    if (!sendMail) {
      throw new CustomError("email not send successfully", 500);
    }

    return sendMail;
  } catch (error) {
    console.log("Error forgot password", error);
    return null;
  }
}

async function verifyOTP(
  userInfo: IForgotPassword,
  enteredOTP: string
): Promise<boolean | null> {
  try {
    const user = await userRepository.findByEmailAndRole(
      userInfo.email,
      userInfo.role as UserRole
    );
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const getOTP = cache.get(`${user.email}_${user.role}`);
    if (!getOTP) {
      throw new CustomError("otp expired");
    }

    if (String(getOTP) !== String(enteredOTP)) {
      throw new CustomError("invalid OTP");
    }

    return true;
  } catch (error) {
    console.log("Error verify otp", error);
    return null;
  }
}

async function resetPassword(
  userInfo: IForgotPassword,
  newPassword: string
): Promise<User | null> {
  try {
    const user = await userRepository.findByEmailAndRole(
      userInfo.email,
      userInfo.role as UserRole
    );
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    // hashed password
    const hashedPassword = await genHashedPassword(newPassword);
    if (!hashedPassword) {
      throw new CustomError("password not hashed", 500);
    }

    // update user
    const updatedUser = await userRepository.updatePassword(
      user.email,
      user.role,
      hashedPassword
    );
    if (!updatedUser) {
      throw new CustomError("user password not updated", 500);
    }

    return updatedUser;
  } catch (error) {
    console.log("Error reset password", error);
    return null;
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
