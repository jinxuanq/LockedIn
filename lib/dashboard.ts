import "server-only";

import { ApiError } from "@/lib/api";
import { listInquiries } from "@/lib/inquiries";
import { listBookings } from "@/lib/scheduling";
import { createClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import { getProfile } from "@/lib/tutors";
import type { SafeUser } from "@/lib/types";

export async function getNotifications(user: SafeUser) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);
  throwIfSupabaseError(error);
  return (data ?? []).map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  }));
}

export async function markNotificationsRead(user: SafeUser): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  throwIfSupabaseError(error);
}

export async function getDashboard(user: SafeUser) {
  const supabase = await createClient();
  const [profile, bookings, inquiries, notifications, unreadResult, conversationResult] =
    await Promise.all([
      getProfile(user),
      listBookings(user),
      listInquiries(user),
      getNotifications(user),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null),
      supabase
        .from("conversation_members")
        .select("conversation_id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);
  throwIfSupabaseError(unreadResult.error);
  throwIfSupabaseError(conversationResult.error);

  const upcomingBookings = bookings
    .filter(
      (booking) =>
        booking.startTime > new Date().toISOString() &&
        booking.status !== "cancelled" &&
        booking.status !== "completed",
    )
    .sort((first, second) => first.startTime.localeCompare(second.startTime));

  return {
    user,
    profile,
    stats: {
      upcomingSessions: upcomingBookings.length,
      conversations: conversationResult.count ?? 0,
      inquiries: inquiries.filter((inquiry) => inquiry.status !== "closed").length,
      unreadNotifications: unreadResult.count ?? 0,
    },
    upcomingBookings: upcomingBookings.slice(0, 4),
    recentInquiries: inquiries.slice(0, 4),
    notifications: notifications.slice(0, 5),
  };
}

export async function getAdminOverview(user: SafeUser) {
  if (user.role !== "admin") throw new ApiError(403, "Admin account required.");
  const supabase = await createClient();
  const [students, tutors, pendingTutors, openInquiries, activeRequested, activeConfirmed, tutorRows] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "tutor"),
      supabase.from("tutor_profiles").select("user_id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("inquiries").select("id", { count: "exact", head: true }).neq("status", "closed"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "requested"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.rpc("admin_tutor_overview"),
    ]);
  for (const result of [students, tutors, pendingTutors, openInquiries, activeRequested, activeConfirmed]) {
    throwIfSupabaseError(result.error);
  }
  throwIfSupabaseError(tutorRows.error);

  const mappedTutors = ((tutorRows.data ?? []) as Array<{
    id: string;
    name: string;
    email: string;
    school: string;
    headline: string;
    approved: boolean;
    hourly_rate: number;
    updated_at: string;
    subject_ids: string[];
  }>).map((tutor) => ({
    id: tutor.id,
    name: tutor.name,
    email: tutor.email,
    school: tutor.school,
    headline: tutor.headline,
    approved: tutor.approved,
    hourlyRate: tutor.hourly_rate / 100,
    updatedAt: tutor.updated_at,
    subjectIds: tutor.subject_ids,
  }));

  return {
    counts: {
      students: students.count ?? 0,
      tutors: tutors.count ?? 0,
      pendingTutors: pendingTutors.count ?? 0,
      openInquiries: openInquiries.count ?? 0,
      activeBookings: (activeRequested.count ?? 0) + (activeConfirmed.count ?? 0),
    },
    tutors: mappedTutors,
    inquiries: await listInquiries(user),
  };
}

export async function setTutorApproval(
  user: SafeUser,
  tutorId: string,
  approved: boolean,
): Promise<void> {
  if (user.role !== "admin") throw new ApiError(403, "Admin account required.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_tutor_approval", {
    target_tutor_id: tutorId,
    is_approved: approved,
  });
  throwIfSupabaseError(error);
}
