// internal import
import collageRepository from "../repository/collage";
import bankRepository from "../repository/bank";
import userRepository from "../repository/user";
import stuffRepository from "../repository/stuff";
import profileRepository from "../repository/profile";
import { compareHashedPassword, genHashedPassword } from "../lib/password";
import { CustomError } from "../lib/error";

// types import
import { TLoginClient } from "../zod/auth";
import { TCollageClient } from "../zod/collage";
import { TBankClient } from "../zod/bank";
import { IBank, ICollage, TProfile, TStuff, TUser } from "../types";
import { User } from "@prisma/client";
import { TStuffClient } from "../zod/user";
import { genJwtAccessToken } from "../lib/jwtToken";

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

    const userPayload: TUser = {
      firstName: userDate.firstName,
      lastName: userDate.lastName,
      email: userDate.email,
      activeStatus: "regular",
      password: hashedPassword,
      role: userDate.role,
      collageId: newCollage.id,
    };

    const newUser = await userRepository.create(userPayload);
    if (!newUser) {
      throw new CustomError("user not created", 500);
    }

    const profilePayload: TProfile = {
      aadharNo: userDate.adhaarNo,
      address: userDate.address,
      phoneNo: userDate.phoneNo,
      userId: newUser.id,
    };
    const newProfile = await profileRepository.create(profilePayload);
    if (!newProfile) {
      throw new CustomError("profile not created", 500);
    }

    const userBankPayload: IBank = {
      bankName: userDate.bankName,
      accountNo: userDate.accountNo,
      ifscCode: userDate.ifscCode,
      accountHolderName: userDate.accountHolderName,
    };
    const newUserBank = await bankRepository.create(userBankPayload);
    if (!newUserBank) {
      throw new CustomError("user's bank not created", 500);
    }

    const stuffPayload: TStuff = {
      highestDegree: userDate.highestDegree,
      specializedIn: userDate.specailizedIn,
      bankAccountId: newUserBank.id,
      profileId: newProfile.id,
    };
    const newStuff = await stuffRepository.create(stuffPayload);
    if (!newStuff) {
      throw new CustomError("stuff not created", 500);
    }

    return newUser;
  } catch (error) {
    console.log("Error in register", error);
    return null;
  }
}

async function login(data: TLoginClient): Promise<string | null> {
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

    return accessToken;
  } catch (error) {
    console.log("Error in login", error);
    return null;
  }
}

// export
export default {
  register,
  login,
};
