import "server-only";

import { ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import type { Booking, SafeUser } from "@/lib/types";

interface BookingRow {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  availability_slot_id: string | null;
  start_time: string;
  end_time: string;
  status: Booking["status"];
  notes: string;
  student: { name: string } | null;
  tutor: { name: string } | null;
  subject: { name: string } | null;
}

const BOOKING_SELECT = `
  id, student_id, tutor_id, subject_id, availability_slot_id,
  start_time, end_time, status, notes,
  student:profiles!bookings_student_id_fkey(name),
  tutor:profiles!bookings_tutor_id_fkey(name),
  subject:subjects!bookings_subject_id_fkey(name)
`;

function mapBooking(row: BookingRow): Booking & { availabilitySlotId: string | null } {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student?.name ?? "Student",
    tutorId: row.tutor_id,
    tutorName: row.tutor?.name ?? "Tutor",
    subjectId: row.subject_id,
    subjectName: row.subject?.name ?? "Subject",
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    availabilitySlotId: row.availability_slot_id,
  };
}

export async function listBookings(user: SafeUser): Promise<Booking[]> {
  void user;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("start_time", { ascending: false });
  throwIfSupabaseError(error);
  return ((data ?? []) as unknown as BookingRow[]).map(mapBooking);
}

export async function listTutorSlots(user: SafeUser) {
  if (user.role !== "tutor") throw new ApiError(403, "Tutor account required.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, tutor_id, start_time, end_time, status")
    .eq("tutor_id", user.id)
    .gt("start_time", new Date().toISOString())
    .order("start_time");
  throwIfSupabaseError(error);
  return (data ?? []).map((slot) => ({
    id: slot.id,
    tutorId: slot.tutor_id,
    startTime: slot.start_time,
    endTime: slot.end_time,
    status: slot.status,
  }));
}

export async function addAvailability(
  user: SafeUser,
  input: { startTime: string; endTime: string },
) {
  if (user.role !== "tutor") throw new ApiError(403, "Tutor account required.");
  if (new Date(input.startTime).getTime() <= Date.now()) {
    throw new ApiError(422, "Availability must be in the future.");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_availability", {
    slot_start: input.startTime,
    slot_end: input.endTime,
  });
  throwIfSupabaseError(error);
  if (typeof data !== "string") throw new ApiError(500, "Could not add availability.");
  return { id: data, tutorId: user.id, ...input, status: "open" as const };
}

export async function removeAvailability(user: SafeUser, slotId: string): Promise<void> {
  if (user.role !== "tutor") throw new ApiError(403, "Tutor account required.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_availability", { slot_id: slotId });
  throwIfSupabaseError(error);
}

export async function createBooking(
  user: SafeUser,
  input: {
    tutorId: string;
    subjectId: string;
    availabilitySlotId: string;
    notes: string;
  },
): Promise<Booking> {
  if (user.role !== "student") throw new ApiError(403, "Student account required.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    selected_tutor_id: input.tutorId,
    selected_subject_id: input.subjectId,
    selected_slot_id: input.availabilitySlotId,
    booking_notes: input.notes,
  });
  throwIfSupabaseError(error);
  if (typeof data !== "string") throw new ApiError(500, "Could not create booking.");
  return getBooking(data, user);
}

export async function getBooking(bookingId: string, user: SafeUser): Promise<Booking> {
  void user;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .maybeSingle();
  throwIfSupabaseError(error);
  if (!data) throw new ApiError(404, "Booking not found.");
  return mapBooking(data as unknown as BookingRow);
}

export async function updateBooking(
  user: SafeUser,
  bookingId: string,
  status: "confirmed" | "completed" | "cancelled",
): Promise<Booking> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_booking_status", {
    target_booking_id: bookingId,
    next_status: status,
  });
  throwIfSupabaseError(error);
  return getBooking(bookingId, user);
}
