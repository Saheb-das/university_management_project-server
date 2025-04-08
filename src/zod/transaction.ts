import { z } from "zod";

// Enums using Zod
const TransactionType = z.nativeEnum({
  salary: "salary",
  tutionFee: "tutionFee",
});

const TransactionMode = z.nativeEnum({
  online: "online",
  banking: "banking",
  cash: "cash",
});

const Month = z.nativeEnum({
  january: "january",
  february: "february",
  march: "march",
  april: "april",
  may: "may",
  june: "june",
  july: "july",
  august: "august",
  september: "september",
  october: "october",
  november: "november",
  december: "december",
});

// Salary Schema
const SalarySchema = z.object({
  inMonth: Month,
  salaryAmount: z.string().min(1, "Salary amount is required"),
  performanceBonus: z.string().optional(),
  totalAmount: z.string().min(1, "Total amount is required"),
});

type TSalaryClient = z.infer<typeof SalarySchema>;

// Tuition Fee Schema
const TutionFeeSchema = z.object({
  semNo: z.number().min(1, "Semester number must be positive"),
  semFees: z.string().min(1, "Semester fees required"),
  lateFine: z.string().optional(),
  totalAmount: z.string().min(1, "Total amount required"),
});

type TTutionFeeClient = z.infer<typeof TutionFeeSchema>;

// Transaction Schema
export const transactionSchema = z.object({
  type: TransactionType,
  userRole: z.string(), // Assuming UserRole is a string
  amount: z.string().min(1, "Amount is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  mode: TransactionMode,
  utr: z.string(),
  salary: SalarySchema.optional(),
  tutionFee: TutionFeeSchema.optional(),
});

export type TTransactionClient = z.infer<typeof transactionSchema>;
