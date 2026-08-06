import "server-only";

import { ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import type { SafeUser } from "@/lib/types";

interface InquiryInput {
  requestedTutorId?: string | null;
  subjectId: string;
  goals: string;
  availabilityNotes: string;
}

interface InquiryRow {
  id: string;
  student_id: string;
  requested_tutor_id: string | null;
  assigned_tutor_id: string | null;
  subject_id: string;
  goals: string;
  availability_notes: string;
  status: "new" | "matched" | "closed";
  created_at: string;
  updated_at: string;
  student: { name: string } | null;
  requested: { name: string } | null;
  assigned: { name: string } | null;
  subject: { name: string } | null;
  conversation: { id: string } | Array<{ id: string }> | null;
}

const INQUIRY_SELECT = `
  id, student_id, requested_tutor_id, assigned_tutor_id, subject_id,
  goals, availability_notes, status, created_at, updated_at,
  student:profiles!inquiries_student_id_fkey(name),
  requested:profiles!inquiries_requested_tutor_id_fkey(name),
  assigned:profiles!inquiries_assigned_tutor_id_fkey(name),
  subject:subjects!inquiries_subject_id_fkey(name),
  conversation:conversations!conversations_inquiry_id_fkey(id)
`;

function mapInquiry(row: InquiryRow) {
  const conversation = Array.isArray(row.conversation) ? row.conversation[0] : row.conversation;
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student?.name ?? "Student",
    requestedTutorId: row.requested_tutor_id,
    requestedTutorName: row.requested?.name ?? null,
    assignedTutorId: row.assigned_tutor_id,
    assignedTutorName: row.assigned?.name ?? null,
    subjectId: row.subject_id,
    subjectName: row.subject?.name ?? "Subject",
    goals: row.goals,
    availabilityNotes: row.availability_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    conversationId: conversation?.id ?? null,
  };
}

export async function createInquiry(user: SafeUser, input: InquiryInput) {
  if (user.role !== "student") throw new ApiError(403, "Student account required.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_inquiry", {
    selected_tutor_id: input.requestedTutorId ?? null,
    selected_subject_id: input.subjectId,
    inquiry_goals: input.goals,
    inquiry_availability_notes: input.availabilityNotes,
  });
  throwIfSupabaseError(error);
  if (typeof data !== "string") throw new ApiError(500, "Could not create inquiry.");
  return getInquiry(data, user);
}

export async function listInquiries(user: SafeUser) {
  void user;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(INQUIRY_SELECT)
    .order("created_at", { ascending: false });
  throwIfSupabaseError(error);
  return ((data ?? []) as unknown as InquiryRow[]).map(mapInquiry);
}

export async function getInquiry(inquiryId: string, user: SafeUser) {
  void user;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(INQUIRY_SELECT)
    .eq("id", inquiryId)
    .maybeSingle();
  throwIfSupabaseError(error);
  if (!data) throw new ApiError(404, "Inquiry not found.");
  return mapInquiry(data as unknown as InquiryRow);
}

export async function updateInquiry(
  user: SafeUser,
  inquiryId: string,
  input: { assignedTutorId?: string | null; status?: "new" | "matched" | "closed" },
) {
  if (user.role !== "admin") throw new ApiError(403, "Admin account required.");
  const current = await getInquiry(inquiryId, user);
  const assignedTutorId = Object.hasOwn(input, "assignedTutorId")
    ? input.assignedTutorId ?? null
    : current.assignedTutorId;
  const status = input.status ?? current.status;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_inquiry", {
    target_inquiry_id: inquiryId,
    new_assigned_tutor_id: assignedTutorId,
    new_status: status,
  });
  throwIfSupabaseError(error);
  return getInquiry(inquiryId, user);
}
