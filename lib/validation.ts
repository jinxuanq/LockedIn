import { z } from "zod";

const trimmed = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const registerSchema = z.object({
  name: trimmed(2, 80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(["student", "tutor"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(1).max(128),
});

export const studentProfileSchema = z.object({
  name: trimmed(2, 80),
  gradeLevel: trimmed(1, 40),
  guardianName: z.string().trim().max(80).default(""),
  goals: trimmed(10, 1200),
  timezone: trimmed(2, 80).default("America/New_York"),
});

export const tutorProfileSchema = z.object({
  name: trimmed(2, 80),
  pronouns: z.string().trim().max(30).default(""),
  school: trimmed(2, 100),
  headline: trimmed(5, 140),
  bio: trimmed(40, 1500),
  imageUrl: z.string().trim().max(300).default("/images/hero-tutors.jpg"),
  hourlyRate: z.coerce.number().int().min(0).max(500),
  timezone: trimmed(2, 80).default("America/New_York"),
  subjectIds: z.array(z.string().min(1).max(100)).min(1).max(12),
});

export const inquirySchema = z.object({
  requestedTutorId: z.string().trim().min(1).max(100).nullable().optional(),
  subjectId: z.string().trim().min(1).max(100),
  goals: trimmed(20, 1500),
  availabilityNotes: z.string().trim().max(500).default(""),
});

export const inquiryUpdateSchema = z.object({
  assignedTutorId: z.string().trim().min(1).max(100).nullable().optional(),
  status: z.enum(["new", "matched", "closed"]).optional(),
});

export const messageSchema = z.object({
  body: trimmed(1, 2000),
});

export const availabilitySchema = z
  .object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine((value) => new Date(value.startTime) < new Date(value.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine(
    (value) =>
      new Date(value.endTime).getTime() - new Date(value.startTime).getTime() <=
      4 * 60 * 60 * 1000,
    { message: "Availability slots cannot exceed four hours", path: ["endTime"] },
  );

export const bookingSchema = z.object({
  tutorId: z.string().trim().min(1).max(100),
  subjectId: z.string().trim().min(1).max(100),
  availabilitySlotId: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(800).default(""),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

export const curriculumGoalSchema = z.object({
  studentId: z.string().trim().min(1).max(100),
  subjectId: z.string().trim().min(1).max(100),
  title: trimmed(5, 140),
  description: z.string().trim().max(1200).default(""),
  targetDate: z.string().date().nullable().optional(),
});

export const progressEntrySchema = z.object({
  goalId: z.string().trim().min(1).max(100),
  bookingId: z.string().trim().min(1).max(100).nullable().optional(),
  summary: trimmed(10, 1500),
  nextSteps: z.string().trim().max(1000).default(""),
  mastery: z.coerce.number().int().min(1).max(5),
});

export const conversationSchema = z.object({
  userId: z.string().trim().min(1).max(100),
});

export const tutorSearchSchema = z.object({
  q: z.string().trim().max(100).default(""),
  subject: z.string().trim().max(100).default(""),
  maxRate: z.coerce.number().int().min(0).max(500).optional(),
});
