// external import
import { z } from "zod";

export const collageSchema = z.object({
  name: z.string().min(6, "atleat 6 char required"),
  address: z.string().min(6, "atleat 6 char required"),
  registrationNo: z.string().min(6, "atleat 6 char required"),
  established: z.string().regex(/^\d{4}$/, "Invalid year format"),
});

export type TCollageClient = z.infer<typeof collageSchema>;
