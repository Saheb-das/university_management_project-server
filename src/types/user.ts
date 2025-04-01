// types import
import { User, Profile, Student, Stuff } from "@prisma/client";

type Role =
  | "admin"
  | "superadmin"
  | "counsellor"
  | "examceller"
  | "accountant"
  | "student";

type TUser = Omit<User, "id" | "createdAt" | "updatedAt">;
type TProfile = Omit<Profile, "id" | "avatar" | "createdAt" | "updatedAt">;
type TStuff = Omit<Stuff, "id" | "createdAt" | "updatedAt">;
type TStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;

export { TUser, TProfile, TStudent, TStuff };
