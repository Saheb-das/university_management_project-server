// internal import
import userRepository from "../repository/user";
import { CustomError } from "../lib/error";
import { compareHashedPassword, genHashedPassword } from "../lib/password";
import conversationRespoitory from "../repository/conversation";
import participantRepository from "../repository/participant";

// types import
import { ActiveStatus, User, UserRole } from "@prisma/client";
import {
  TStuffClient,
  TStuffRole,
  TUpdateStudentInput,
  TUpdateStuffInput,
} from "../zod/user";
import { IConversation } from "../repository/conversation";
import { IParticipant } from "../repository/participant";
import { IChangePassword } from "../controller/user";

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

    // conversation create
    if (newUser.role === "superadmin") {
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
    } else if (newUser.role === "admin") {
      // find announcement conversation
      const announceCon = await conversationRespoitory.findByNameAndCollageId({
        conName: "announcement",
        collageId: newUser.collageId,
      });
      if (!announceCon) {
        throw new CustomError("announcement conversation not found", 404);
      }

      const participantPayload: IParticipant = {
        role: newUser.role,
        conId: announceCon.id,
        userId: newUser.id,
      };

      // add user to announcement conversation
      const addNewParticipant = await participantRepository.create(
        participantPayload
      );
      if (!addNewParticipant) {
        throw new CustomError("participant not created", 500);
      }

      const dropboxPayload: IConversation = {
        conName: "dropbox",
        collageId: newUser.collageId,
      };

      // create dropbox conversation
      const newDropboxConversation = await conversationRespoitory.create(
        dropboxPayload
      );
      if (!newDropboxConversation) {
        throw new CustomError("dropbox conversation not created", 500);
      }
    } else if (
      newUser.role === "accountant" ||
      newUser.role === "counsellor" ||
      newUser.role === "examceller" ||
      newUser.role === "teacher"
    ) {
      // find announcement conversation
      const announcementCon =
        await conversationRespoitory.findByNameAndCollageId({
          conName: "announcement",
          collageId: newUser.collageId,
        });
      if (!announcementCon) {
        throw new CustomError("announcement conversation not found", 404);
      }

      // find dropbox conversation
      const dropboxCon = await conversationRespoitory.findByNameAndCollageId({
        conName: "dropbox",
        collageId: newUser.collageId,
      });
      if (!dropboxCon) {
        throw new CustomError("dropbox conversation not found", 404);
      }

      const announcePartPayload: IParticipant = {
        conId: announcementCon.id,
        role: newUser.role,
        userId: newUser.id,
      };

      // add to announcement conversation
      const addToAnnouncement = await participantRepository.create(
        announcePartPayload
      );
      if (!addToAnnouncement) {
        throw new CustomError("announcement participant not created", 500);
      }

      const dropboxPartPayload: IParticipant = {
        conId: dropboxCon.id,
        role: newUser.role,
        userId: newUser.id,
      };

      // add to dropbox conversation
      const addToDropbox = await participantRepository.create(
        dropboxPartPayload
      );
      if (!addToDropbox) {
        throw new CustomError("dropbox participant not created", 500);
      }

      const roleComPayload: IConversation = {
        conName: `community ${newUser.role}`,
        collageId: newUser.collageId,
      };

      // create role based community
      const newRoledCommunity = await conversationRespoitory.create(
        roleComPayload
      );
      if (!newRoledCommunity) {
        throw new CustomError("community not created", 500);
      }
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

async function changePassword(
  userId: string,
  collageId: string,
  passInfo: IChangePassword
): Promise<User | null> {
  try {
    const user = await userRepository.findById(userId, collageId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const isValidPass = await compareHashedPassword(
      passInfo.oldPass,
      user.password
    );
    if (!isValidPass) {
      throw new CustomError("invalid password");
    }

    const hashed = await genHashedPassword(passInfo.newPass);
    if (!hashed) {
      throw new CustomError("password not hashed", 500);
    }

    const updatedPassword = await userRepository.updatePassword(
      user.email,
      user.role,
      hashed
    );
    if (!updatedPassword) {
      throw new CustomError("password not updated", 500);
    }

    return updatedPassword;
  } catch (error) {
    console.log("Error changing password", 500);
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
  changePassword,
};
