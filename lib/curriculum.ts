import "server-only";

import { ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import type { SafeUser } from "@/lib/types";

interface GoalRow {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  title: string;
  description: string;
  status: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  student: { name: string } | null;
  tutor: { name: string } | null;
  subject: { name: string } | null;
}

interface EntryRow {
  id: string;
  goal_id: string;
  booking_id: string | null;
  summary: string;
  next_steps: string;
  mastery: number;
  created_at: string;
  tutor: { name: string } | null;
}

const GOAL_SELECT = `
  id, student_id, tutor_id, subject_id, title, description, status,
  target_date, created_at, updated_at,
  student:profiles!curriculum_goals_student_id_fkey(name),
  tutor:profiles!curriculum_goals_tutor_id_fkey(name),
  subject:subjects!curriculum_goals_subject_id_fkey(name)
`;

function mapGoal(goal: GoalRow, entries: EntryRow[]) {
  return {
    id: goal.id,
    studentId: goal.student_id,
    studentName: goal.student?.name ?? "Student",
    tutorId: goal.tutor_id,
    tutorName: goal.tutor?.name ?? "Tutor",
    subjectId: goal.subject_id,
    subjectName: goal.subject?.name ?? "Subject",
    title: goal.title,
    description: goal.description,
    status: goal.status,
    targetDate: goal.target_date,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    entries: entries
      .filter((entry) => entry.goal_id === goal.id)
      .map((entry) => ({
        id: entry.id,
        goalId: entry.goal_id,
        bookingId: entry.booking_id,
        summary: entry.summary,
        nextSteps: entry.next_steps,
        mastery: entry.mastery,
        createdAt: entry.created_at,
        tutorName: entry.tutor?.name ?? "Tutor",
      })),
  };
}

export async function listCurriculum(user: SafeUser) {
  void user;
  const supabase = await createClient();
  const { data: goals, error: goalError } = await supabase
    .from("curriculum_goals")
    .select(GOAL_SELECT)
    .order("updated_at", { ascending: false });
  throwIfSupabaseError(goalError);
  const goalRows = (goals ?? []) as unknown as GoalRow[];
  if (!goalRows.length) return [];

  const { data: entries, error: entryError } = await supabase
    .from("progress_entries")
    .select("id, goal_id, booking_id, summary, next_steps, mastery, created_at, tutor:profiles!progress_entries_tutor_id_fkey(name)")
    .in("goal_id", goalRows.map((goal) => goal.id))
    .order("created_at", { ascending: false });
  throwIfSupabaseError(entryError);
  const entryRows = (entries ?? []) as unknown as EntryRow[];
  return goalRows.map((goal) => mapGoal(goal, entryRows));
}

export async function listTutorStudents(user: SafeUser) {
  if (user.role !== "tutor" && user.role !== "admin") {
    throw new ApiError(403, "Tutor account required.");
  }
  const supabase = await createClient();
  if (user.role === "admin") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "student")
      .order("name");
    throwIfSupabaseError(error);
    return (data ?? []).map((student) => ({ ...student, email: "" }));
  }

  const [{ data: bookings, error: bookingError }, { data: inquiries, error: inquiryError }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("student_id")
        .eq("tutor_id", user.id)
        .neq("status", "cancelled"),
      supabase
        .from("inquiries")
        .select("student_id")
        .eq("assigned_tutor_id", user.id)
        .neq("status", "closed"),
    ]);
  throwIfSupabaseError(bookingError);
  throwIfSupabaseError(inquiryError);
  const studentIds = [...new Set([
    ...(bookings ?? []).map((booking) => booking.student_id as string),
    ...(inquiries ?? []).map((inquiry) => inquiry.student_id as string),
  ])];
  if (!studentIds.length) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", studentIds)
    .order("name");
  throwIfSupabaseError(error);
  return (data ?? []).map((student) => ({ ...student, email: "" }));
}

export async function createGoal(
  user: SafeUser,
  input: {
    studentId: string;
    subjectId: string;
    title: string;
    description: string;
    targetDate?: string | null;
  },
) {
  if (user.role !== "tutor") throw new ApiError(403, "Tutor account required.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_curriculum_goal", {
    selected_student_id: input.studentId,
    selected_subject_id: input.subjectId,
    goal_title: input.title,
    goal_description: input.description,
    goal_target_date: input.targetDate ?? null,
  });
  throwIfSupabaseError(error);
  if (typeof data !== "string") throw new ApiError(500, "Could not create goal.");
  return (await listCurriculum(user)).find((goal) => goal.id === data);
}

export async function addProgressEntry(
  user: SafeUser,
  input: {
    goalId: string;
    bookingId?: string | null;
    summary: string;
    nextSteps: string;
    mastery: number;
  },
) {
  if (user.role !== "tutor") throw new ApiError(403, "Tutor account required.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_progress_entry", {
    selected_goal_id: input.goalId,
    selected_booking_id: input.bookingId ?? null,
    entry_summary: input.summary,
    entry_next_steps: input.nextSteps,
    entry_mastery: input.mastery,
  });
  throwIfSupabaseError(error);
  if (typeof data !== "string") throw new ApiError(500, "Could not add progress entry.");
  return (await listCurriculum(user))
    .find((goal) => goal.id === input.goalId)
    ?.entries.find((entry) => entry.id === data);
}
