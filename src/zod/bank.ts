// external import
import { z } from "zod";

export const bankSchema = z.object({
  accountNo: z.string(),
  ifscCode: z.string(),
  bankName: z.string(),
  accountHolderName: z.string(),
});

export type TBankClient = z.infer<typeof bankSchema>;
