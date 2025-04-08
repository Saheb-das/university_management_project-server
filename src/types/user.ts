// types import
import {
  User,
  Profile,
  Student,
  Stuff,
  UserRole,
  ActiveStatus,
} from "@prisma/client";

type Role =
  | "admin"
  | "superadmin"
  | "counsellor"
  | "examceller"
  | "accountant"
  | "student";

export type TUser = Omit<User, "id" | "createdAt" | "updatedAt">;
export type TProfile = Omit<
  Profile,
  "id" | "avatar" | "createdAt" | "updatedAt"
>;
export type TStuff = Omit<Stuff, "id" | "createdAt" | "updatedAt">;
export type TStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;
