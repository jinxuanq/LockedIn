import assert from "node:assert/strict";
import test from "node:test";
import {
  availabilitySchema,
  inquirySchema,
  messageSchema,
  registerSchema,
} from "../lib/validation";

test("registration requires a strong password and a supported role", () => {
  assert.equal(
    registerSchema.safeParse({
      name: "Alex Student",
      email: "alex@example.com",
      password: "SecurePass123",
      role: "student",
    }).success,
    true,
  );
  assert.equal(
    registerSchema.safeParse({
      name: "Alex Student",
      email: "alex@example.com",
      password: "weak",
      role: "admin",
    }).success,
    false,
  );
});

test("inquiries require meaningful goals", () => {
  assert.equal(
    inquirySchema.safeParse({
      subjectId: "subject-math",
      goals: "I want to build confidence with quadratic functions.",
      availabilityNotes: "Weekdays after 4 PM",
    }).success,
    true,
  );
  assert.equal(
    inquirySchema.safeParse({ subjectId: "subject-math", goals: "Help" }).success,
    false,
  );
});

test("availability rejects backwards and excessively long time ranges", () => {
  const start = new Date(Date.now() + 86_400_000);
  assert.equal(
    availabilitySchema.safeParse({
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + 3_600_000).toISOString(),
    }).success,
    true,
  );
  assert.equal(
    availabilitySchema.safeParse({
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() - 3_600_000).toISOString(),
    }).success,
    false,
  );
});

test("messages enforce database-compatible length limits", () => {
  assert.equal(messageSchema.safeParse({ body: "Hello" }).success, true);
  assert.equal(messageSchema.safeParse({ body: "" }).success, false);
  assert.equal(messageSchema.safeParse({ body: "x".repeat(2001) }).success, false);
});
