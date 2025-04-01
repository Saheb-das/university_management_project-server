// external import
import { z } from "zod";

// internal import
import { collageSchema } from "./collage";
import { stuffSchema } from "./user";
import { bankSchema } from "./bank";

export const passwordValidation = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
  );

export const phoneNoValidation = z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^\d{10}$/, "Phone number must only contain digits");

const registerSchema = z.object({
  user: stuffSchema,
  collage: collageSchema,
  collageBankDetails: bankSchema,
});

export type TRegisterClient = z.infer<typeof registerSchema>;

export const RoleEnum = z.enum([
  "superadmin",
  "admin",
  "counsellor",
  "examceller",
  "accountant",
  "teacher",
  "student",
]);

export const loginSchema = z.object({
  role: RoleEnum,
  email: z.string().email(),
  password: passwordValidation,
});

export type TLoginClient = z.infer<typeof loginSchema>;
