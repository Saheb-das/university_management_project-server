import { z } from "zod";

const eventTypeEnum = z.enum([
  "academic",
  "cultural_festive",
  "sports",
  "technical",
  "social_awareness",
  "alumni_networking",
  "fun_informal",
]);

export const eventSchema = z.object({
  title: z.string().min(2, "atleast 2 char required"),
  date: z.string().min(10, "maintain dd-mm-yyyy format"),
  time: z.string().min(4, "maintain hh:mm format"),
  place: z.string().min(2, "atleast 2 char required"),
  url: z.string().optional(),
  avatar: z.string().optional(),
  type: eventTypeEnum,
});

// If you also want to export the inferred TypeScript type
export type TEventClient = z.infer<typeof eventSchema>;
