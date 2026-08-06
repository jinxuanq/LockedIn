"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";
import WorkspaceNav from "@/components/WorkspaceNav";
import { EmptyState, PageHeader } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { Booking } from "@/lib/types";

interface DashboardData {
  stats: { upcomingSessions: number; conversations: number; inquiries: number; unreadNotifications: number };
  upcomingBookings: Booking[];
  recentInquiries: Array<{
    id: string;
    studentName: string;
    assignedTutorName: string | null;
    subjectName: string;
    status: string;
    conversationId: string | null;
  }>;
  notifications: Array<{ id: string; title: string; body: string; createdAt: string; readAt: string | null }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    apiFetch<DashboardData>("/api/dashboard").then(setData).catch((caught) => setError(caught.message));
  }, [user]);

  return (
    <ProtectedPage>
      <WorkspaceNav />
      <main className="min-h-[70vh] bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <PageHeader
            eyebrow={`${user?.role ?? "Member"} workspace`}
            title={`Welcome back, ${user?.name.split(" ")[0] ?? "there"}.`}
            description="Your messages, upcoming sessions, and academic work are collected in one place."
            action={user?.role === "student" ? <Link href="/tutors" className="rounded-md bg-[#8B1E3F] px-5 py-2.5 text-sm font-semibold text-white">Find a tutor</Link> : undefined}
          />
          {error ? <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">{error}</p> : null}
          {!data ? <p className="mt-10 text-gray-500">Loading overview…</p> : (
            <>
              <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Upcoming sessions", data.stats.upcomingSessions],
                  ["Conversations", data.stats.conversations],
                  ["Open inquiries", data.stats.inquiries],
                  ["New notifications", data.stats.unreadNotifications],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-[#001F3F]">{value}</p>
                  </div>
                ))}
              </section>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#001F3F]">Upcoming sessions</h2>
                    <Link href="/schedule" className="text-sm font-semibold text-[#8B1E3F]">Full schedule →</Link>
                  </div>
                  <div className="mt-5 space-y-3">
                    {data.upcomingBookings.length ? data.upcomingBookings.map((booking) => (
                      <div key={booking.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#001F3F]">{booking.subjectName} with {user?.role === "student" ? booking.tutorName : booking.studentName}</p>
                            <p className="mt-1 text-sm text-gray-600">{new Date(booking.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                          </div>
                          <span className="rounded-full bg-[#001F3F]/5 px-3 py-1 text-xs font-semibold capitalize text-[#001F3F]">{booking.status}</span>
                        </div>
                      </div>
                    )) : <EmptyState title="No upcoming sessions" body="New bookings will appear here." />}
                  </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#001F3F]">Notifications</h2>
                    <Link href="/messages" className="text-sm font-semibold text-[#8B1E3F]">Messages →</Link>
                  </div>
                  <div className="mt-5 divide-y divide-gray-100">
                    {data.notifications.length ? data.notifications.map((notification) => (
                      <div key={notification.id} className="py-4 first:pt-0">
                        <p className="text-sm font-semibold text-[#001F3F]">{notification.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{notification.body}</p>
                      </div>
                    )) : <p className="text-sm text-gray-500">You’re all caught up.</p>}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}
