// external import
import { z } from "zod";

const currentYear = new Date().getFullYear();

export const yearSchema = z.object({
  year: z
    .number()
    .int()
    .min(2000, { message: "Year must be after 2000" })
    .max(currentYear, { message: `Year cannot be in the future` }),
});
