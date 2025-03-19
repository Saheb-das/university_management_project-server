// types import
import { Request } from "express";

export type TRole =
  | "superadmin"
  | "admin"
  | "counsellor"
  | "examceller"
  | "accountant"
  | "teacher"
  | "student";

// auth request
export interface AuthRequest<ReqBody = {}, Params = {}, Query = {}>
  extends Request<Params, any, ReqBody, Query> {
  authUser?: {
    id: string;
    role: TRole;
    email: string;
    collageId: string;
  };
}
