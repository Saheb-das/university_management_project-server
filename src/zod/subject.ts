// external import
import { object, z } from "zod";

const subjectSchema = z.object({
  name: z.string().min(3, "atleast 3 char required"),
  code: z.string().min(3, "atleast 3 char required"),
  credit: z.number().min(1, "atleast 1 char required"),
});

export const subjectsSchema = z
  .record(z.array(subjectSchema).nonempty())
  .refine(
    (schema) => Object.keys(schema).length > 0,
    "JSON schema is required and cannot be empty"
  );

export type TSubjectsClient = z.infer<typeof subjectsSchema>;
