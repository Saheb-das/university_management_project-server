import { z } from "zod";

// Utility to parse time string into a Date object (on the same dummy day)
const parseTimeToDate = (time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0); // hours, minutes, seconds, ms
  return date;
};

const lectureSchema = z
  .object({
    subject: z.string().min(1, "Subject is required"),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
    room: z.string().min(1, "Room is required"),
  })
  .refine(
    ({ startTime, endTime }) => {
      const start = parseTimeToDate(startTime);
      const end = parseTimeToDate(endTime);
      return start < end;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

const scheduleSchema = z.object({
  break: z.string().min(1, "Break info is required"),
  day: z.string().min(1, "Day is required"),
  lectures: z.array(lectureSchema).min(1, "At least one lecture is required"),
});

export const routineSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  semesterId: z.string().min(1, "Semester ID is required"),
  schedules: z
    .array(scheduleSchema)
    .min(1, "At least one schedule is required"),
});
