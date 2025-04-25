// external import
import { z } from "zod";

export const projectSchema = z.object({
  projectImg: z.string().optional(),
  title: z.string().min(4, "min 4 char needed"),
  projectType: z.enum(["solo", "group"]),
  projectLink: z.string().min(1, "atleast 1 char needed"),
});

export type TProjectClient = z.infer<typeof projectSchema>;
