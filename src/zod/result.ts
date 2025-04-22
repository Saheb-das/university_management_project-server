import { z } from "zod";

// Define the subject schema
const subjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  marks: z.number(),
});

// Define the result schema
export const resultSchema = z.object({
  studentId: z.string(),
  semesterId: z.string(),
  subjects: z.array(subjectSchema),
  examId: z.string(),
});
