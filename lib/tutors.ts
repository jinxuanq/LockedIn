import "server-only";

import { ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import type { SafeUser, Subject, TutorSummary } from "@/lib/types";

interface TutorQueryRow {
  user_id: string;
  pronouns: string;
  school: string;
  headline: string;
  bio: string;
  image_url: string;
  hourly_rate: number;
  timezone: string;
  approved: boolean;
  profile: { id: string; name: string } | null;
}

interface TutorSubjectQueryRow {
  tutor_id: string;
  subject: Subject | null;
}

const TUTOR_SELECT = `
  user_id, pronouns, school, headline, bio, image_url, hourly_rate, timezone, approved,
  profile:profiles!tutor_profiles_user_id_fkey(id, name)
`;

function mapTutor(row: TutorQueryRow, subjects: Subject[]): TutorSummary {
  return {
    id: row.user_id,
    name: row.profile?.name ?? "Tutor",
    pronouns: row.pronouns,
    school: row.school,
    headline: row.headline,
    bio: row.bio,
    image: row.image_url,
    hourlyRate: row.hourly_rate / 100,
    timezone: row.timezone,
    approved: row.approved,
    subjects,
  };
}

async function loadTutorSubjects(tutorIds: string[]): Promise<Map<string, Subject[]>> {
  const subjectsByTutor = new Map<string, Subject[]>();
  if (!tutorIds.length) return subjectsByTutor;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutor_subjects")
    .select("tutor_id, subject:subjects!tutor_subjects_subject_id_fkey(id, slug, name, category)")
    .in("tutor_id", tutorIds);
  throwIfSupabaseError(error);

  for (const row of (data ?? []) as unknown as TutorSubjectQueryRow[]) {
    if (!row.subject) continue;
    subjectsByTutor.set(row.tutor_id, [...(subjectsByTutor.get(row.tutor_id) ?? []), row.subject]);
  }
  return subjectsByTutor;
}

export async function listSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, slug, name, category")
    .order("category")
    .order("name");
  throwIfSupabaseError(error);
  return (data ?? []) as Subject[];
}

export async function listTutors(filters: {
  q?: string;
  subject?: string;
  maxRate?: number;
} = {}): Promise<TutorSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tutor_profiles")
    .select(TUTOR_SELECT)
    .eq("approved", true)
    .order("updated_at", { ascending: false });
  if (filters.maxRate !== undefined) query = query.lte("hourly_rate", filters.maxRate * 100);
  const { data, error } = await query;
  throwIfSupabaseError(error);

  const rows = (data ?? []) as unknown as TutorQueryRow[];
  const subjectsByTutor = await loadTutorSubjects(rows.map((row) => row.user_id));
  let tutors = rows.map((row) => mapTutor(row, subjectsByTutor.get(row.user_id) ?? []));
  if (filters.subject) {
    tutors = tutors.filter((tutor) =>
      tutor.subjects.some(
        (subject) => subject.id === filters.subject || subject.slug === filters.subject,
      ),
    );
  }
  if (filters.q) {
    const term = filters.q.toLocaleLowerCase();
    tutors = tutors.filter((tutor) =>
      [tutor.name, tutor.school, tutor.headline, tutor.bio, ...tutor.subjects.map((item) => item.name)]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }
  return tutors.sort((first, second) => first.name.localeCompare(second.name));
}

export async function getTutor(
  tutorId: string,
  includeUnapproved = false,
): Promise<TutorSummary | null> {
  const supabase = await createClient();
  let query = supabase.from("tutor_profiles").select(TUTOR_SELECT).eq("user_id", tutorId);
  if (!includeUnapproved) query = query.eq("approved", true);
  const { data, error } = await query.maybeSingle();
  throwIfSupabaseError(error);
  if (!data) return null;
  const row = data as unknown as TutorQueryRow;
  const subjectsByTutor = await loadTutorSubjects([row.user_id]);
  return mapTutor(row, subjectsByTutor.get(row.user_id) ?? []);
}

export async function getTutorAvailability(tutorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, tutor_id, start_time, end_time, status")
    .eq("tutor_id", tutorId)
    .eq("status", "open")
    .gt("start_time", new Date().toISOString())
    .order("start_time")
    .limit(30);
  throwIfSupabaseError(error);
  return (data ?? []).map((slot) => ({
    id: slot.id as string,
    tutorId: slot.tutor_id as string,
    startTime: slot.start_time as string,
    endTime: slot.end_time as string,
    status: "open" as const,
  }));
}

export async function updateStudentProfile(
  user: SafeUser,
  input: {
    name: string;
    gradeLevel: string;
    guardianName: string;
    goals: string;
    timezone: string;
  },
): Promise<void> {
  if (user.role !== "student") throw new ApiError(403, "Student account required.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_student_profile", {
    display_name: input.name,
    new_grade_level: input.gradeLevel,
    new_guardian_name: input.guardianName,
    new_goals: input.goals,
    new_timezone: input.timezone,
  });
  throwIfSupabaseError(error);
}

export async function updateTutorProfile(
  user: SafeUser,
  input: {
    name: string;
    pronouns: string;
    school: string;
    headline: string;
    bio: string;
    imageUrl: string;
    hourlyRate: number;
    timezone: string;
    subjectIds: string[];
  },
): Promise<void> {
  if (user.role !== "tutor") throw new ApiError(403, "Tutor account required.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_tutor_profile", {
    display_name: input.name,
    new_pronouns: input.pronouns,
    new_school: input.school,
    new_headline: input.headline,
    new_bio: input.bio,
    new_image_url: input.imageUrl,
    new_hourly_rate: input.hourlyRate * 100,
    new_timezone: input.timezone,
    new_subject_ids: [...new Set(input.subjectIds)],
  });
  throwIfSupabaseError(error);
}

export async function getProfile(user: SafeUser): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  if (user.role === "student") {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("grade_level, guardian_name, goals, timezone")
      .eq("user_id", user.id)
      .single();
    throwIfSupabaseError(error);
    return {
      ...user,
      gradeLevel: data?.grade_level ?? "",
      guardianName: data?.guardian_name ?? "",
      goals: data?.goals ?? "",
      timezone: data?.timezone ?? "America/New_York",
    };
  }
  if (user.role === "tutor") {
    const tutor = await getTutor(user.id, true);
    if (!tutor) throw new ApiError(404, "Tutor profile not found.");
    return {
      ...user,
      ...tutor,
      subjectIds: tutor.subjects.map((subject) => subject.id),
    };
  }
  return { ...user };
}
