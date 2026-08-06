import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const studentProfileSchema = z.object({
  gradeLevel: z.string(),
  guardianName: z.string(),
  goals: z.string(),
  timezone: z.string(),
});

const tutorProfileSchema = z.object({
  pronouns: z.string(),
  school: z.string(),
  headline: z.string(),
  bio: z.string(),
  image: z.string(),
  hourlyRate: z.number().nonnegative(),
  timezone: z.string(),
  approved: z.boolean(),
  subjectSlugs: z.array(z.string()),
});

const localPreviewFixtureSchema = z.object({
  password: z.string().min(8),
  quickAccess: z.array(z.object({ userId: z.string(), label: z.string() })),
  users: z.array(z.discriminatedUnion("role", [
    z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.literal("admin"),
    }),
    z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.literal("student"),
      profile: studentProfileSchema,
    }),
    z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.literal("tutor"),
      profile: tutorProfileSchema,
    }),
  ])),
  activity: z.object({
    studentId: z.string(),
    tutorId: z.string(),
    subjectId: z.string(),
    goals: z.string(),
    availabilityNotes: z.string(),
    studentMessage: z.string(),
    tutorMessage: z.string(),
    bookingNotes: z.string(),
    goalTitle: z.string(),
    goalDescription: z.string(),
    progressSummary: z.string(),
    nextSteps: z.string(),
    mastery: z.number().int().min(1).max(5),
    notificationTitle: z.string(),
    notificationBody: z.string(),
  }),
});

export type LocalPreviewFixture = z.infer<typeof localPreviewFixtureSchema>;

function isLocalPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.LOCAL_PREVIEW_MODE === "true";
}

export function loadLocalPreviewFixture(): LocalPreviewFixture | null {
  if (!isLocalPreviewEnabled()) return null;
  const filename = process.env.LOCAL_PREVIEW_FIXTURE_PATH
    ? path.resolve(process.env.LOCAL_PREVIEW_FIXTURE_PATH)
    : path.join(process.cwd(), ".local-preview", "fixture.json");

  try {
    return localPreviewFixtureSchema.parse(JSON.parse(readFileSync(filename, "utf8")));
  } catch (error) {
    throw new Error(`Local preview mode could not load ${filename}.`, { cause: error });
  }
}

export function getLocalPreviewAccounts() {
  const fixture = loadLocalPreviewFixture();
  if (!fixture) return null;
  const users = new Map(fixture.users.map((user) => [user.id, user]));

  return fixture.quickAccess.map((entry) => {
    const user = users.get(entry.userId);
    if (!user) throw new Error(`Local preview user ${entry.userId} does not exist.`);
    return {
      label: entry.label,
      email: user.email,
      password: fixture.password,
    };
  });
}
