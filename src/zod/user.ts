// external import
import { z } from "zod";

// internal import
import { passwordValidation, phoneNoValidation } from "./auth";

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
});

export type TStudentClient = z.infer<typeof studentSchema>;

export const stuffSchema = z.object({
  firstName: z.string().min(3, "atlast 3 char"),
  lastName: z.string().min(2, "atleast 2 char"),
  email: z.string().email(),
  password: passwordValidation,
  role: z.enum(["student"]),
  address: z.string().min(10, "atleast 10 char"),
  phoneNo: phoneNoValidation,
  adhaarNo: z.string().min(12, "12 char required"),
  highestDegree: z.string(),
  specailizedIn: z.string(),
  bankName: z.string().min(6, "atlast 6 char"),
  ifscCode: z.string().min(6, "atlast 6 char"),
  accountNo: z.string().min(6, "atlast 6 char"),
  accountHolderName: z.string().min(3, "atlast 3 char"),
});

export type TStuffClient = z.infer<typeof stuffSchema>;
