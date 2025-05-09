// external import
import { z } from "zod";

export const stuffRoleSchema = z.enum([
  "superadmin",
  "admin",
  "counsellor",
  "examceller",
  "accountant",
  "teacher",
]);

const passwordValidation = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
  );

const phoneNoValidation = z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^\d{10}$/, "Phone number must only contain digits");

export const statusSchema = z.enum(["regular", "blocked", "suspend"]);
export type TStuffRole = z.infer<typeof stuffRoleSchema>;

export const studentSchema = z.object({
  firstName: z.string().min(3, "atlast 3 char"),
  lastName: z.string().min(2, "atleast 2 char"),
  email: z.string().email(),
  password: passwordValidation,
  role: z.enum(["student"]),
  address: z.string().min(10, "atleast 10 char"),
  phoneNo: phoneNoValidation,
  adhaarNo: z.string().min(12, "12 char required"),
  dob: z.string().min(8, "dd-mm-yyyy formate required"),
  guardianName: z.string().min(4, "atleast 4 char"),
  relWithGuardian: z.string().min(3, "atleast 3 char"),
  gradeAtHigherSec: z.string().min(2, "atleast 2 char"),
  gradeAtSec: z.string().min(2, "atleast 2 char"),
  admissionYear: z.string().min(4, "atleast 4 char required"),
  batch: z.string().min(3, "atleast 3 char"),
});

export type TStudentClient = z.infer<typeof studentSchema>;

export const stuffSchema = z.object({
  firstName: z.string().min(3, "atlast 3 char"),
  lastName: z.string().min(2, "atleast 2 char"),
  email: z.string().email(),
  password: passwordValidation,
  role: stuffRoleSchema,
  address: z.string().min(10, "atleast 10 char"),
  phoneNo: phoneNoValidation,
  adhaarNo: z.string().min(12, "12 char required"),
  highestDegree: z.string().min(3, "atleast 3 char"),
  specializedIn: z.string().min(3, "atleast 3 char"),
  bankName: z.string().min(6, "atlast 6 char"),
  ifscCode: z.string().min(6, "atlast 6 char"),
  accountNo: z.string().min(6, "atlast 6 char"),
  accountHolderName: z.string().min(3, "atlast 3 char"),
});

export type TStuffClient = z.infer<typeof stuffSchema>;

export const updateStuffUserSchema = z.object({
  email: z.string().email().optional(),
  address: z.string().min(1, "Address cannot be empty").optional(),
  phoneNo: phoneNoValidation.optional(),
  highestDegree: z.string().min(1, "Degree cannot be empty").optional(),
  specialization: z
    .string()
    .min(1, "Specialization cannot be empty")
    .optional(),
  bankName: z.string().min(6, "atlast 6 char").optional(),
  ifscCode: z.string().min(6, "atlast 6 char").optional(),
  accountNo: z.string().min(6, "atlast 6 char").optional(),
  accountHolderName: z.string().min(3, "atlast 3 char").optional(),
});

export type TUpdateStuffInput = z.infer<typeof updateStuffUserSchema>;

export const updateStudentUserSchema = z.object({
  email: z.string().email().optional(),
  address: z.string().min(1, "Address cannot be empty").optional(),
  phoneNo: phoneNoValidation.optional(),
  rollNo: z.string().min(6, "Invalid image URL").optional(),
  registretionNo: z.string().min(6, "Invalid image URL").optional(),
});

export type TUpdateStudentInput = z.infer<typeof updateStudentUserSchema>;

export const changePasswordSchema = z
  .object({
    oldPass: z.string().min(1, "Old password is required"),
    newPass: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPass: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.newPass === data.confirmNewPass, {
    path: ["confirmNewPassword"],
    message: "Passwords must match",
  });
