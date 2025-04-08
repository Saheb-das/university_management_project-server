// external import
import { z } from "zod";

export const courseschema = z.object({
  name: z.string().min(3, "atleat 3 char required"),
  duration: z.string().min(1, "atleat 1 char required"),
  semesters: z.string().min(1, "atleat 1 char required"),
  totalFees: z.string().min(3, "atleat 3 char required"),
  degree: z.string().min(3, "atleat 3 char required"),
});

export type TCourseClient = z.infer<typeof courseschema>;
