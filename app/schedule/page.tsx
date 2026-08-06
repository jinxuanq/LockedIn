"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import WorkspaceNav from "@/components/WorkspaceNav";
import { useAuth } from "@/components/AuthProvider";
import { EmptyState, PageHeader, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { Booking } from "@/lib/types";

interface Availability {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [slotForm, setSlotForm] = useState({ startTime: "", endTime: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(async () => {
    const bookingData = await apiFetch<{ bookings: Booking[] }>("/api/bookings");
    setBookings(bookingData.bookings);
    if (user?.role === "tutor") {
      const slotData = await apiFetch<{ availability: Availability[] }>("/api/availability");
      setAvailability(slotData.availability);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!user) return;
    refresh().catch((caught) => setError(caught.message));
  }, [user, refresh]);

  async function updateBooking(id: string, status: "confirmed" | "completed" | "cancelled") {
    setBusy(id + status);
    setError("");
    try {
      await apiFetch(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update booking.");
    } finally {
      setBusy("");
    }
  }

  async function addSlot(event: FormEvent) {
    event.preventDefault();
    setBusy("slot");
    setError("");
    try {
      await apiFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({
          startTime: new Date(slotForm.startTime).toISOString(),
          endTime: new Date(slotForm.endTime).toISOString(),
        }),
      });
      setSlotForm({ startTime: "", endTime: "" });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add availability.");
    } finally {
      setBusy("");
    }
  }

  async function removeSlot(id: string) {
    setBusy(id);
    try {
      await apiFetch(`/api/availability/${id}`, { method: "DELETE" });
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove availability.");
    } finally {
      setBusy("");
    }
  }

  const upcoming = bookings.filter((booking) => booking.startTime > new Date().toISOString() && !["cancelled", "completed"].includes(booking.status));
  const history = bookings.filter((booking) => !upcoming.includes(booking));

  return (
    <ProtectedPage>
      <WorkspaceNav />
      <main className="min-h-[72vh] bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <PageHeader
            eyebrow="Sessions and availability"
            title="Schedule"
            description={user?.role === "tutor" ? "Publish available times, review requests, and keep each session status current." : "Review session requests and confirmed lessons in your local time zone."}
            action={user?.role === "student" ? <Link href="/tutors" className={primaryButtonClass}>Book a tutor</Link> : undefined}
          />
          {error ? <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {user?.role === "tutor" ? (
            <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#001F3F]">Publish availability</h2>
              <form onSubmit={addSlot} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className="text-sm font-semibold text-[#001F3F]">Starts <input className={inputClass} type="datetime-local" value={slotForm.startTime} onChange={(event) => setSlotForm({ ...slotForm, startTime: event.target.value })} required /></label>
                <label className="text-sm font-semibold text-[#001F3F]">Ends <input className={inputClass} type="datetime-local" value={slotForm.endTime} onChange={(event) => setSlotForm({ ...slotForm, endTime: event.target.value })} required /></label>
                <button className={primaryButtonClass} disabled={busy === "slot"}>{busy === "slot" ? "Adding…" : "Add time"}</button>
              </form>
              <div className="mt-6 flex flex-wrap gap-3">
                {availability.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm">
                    <span><strong className="text-[#001F3F]">{new Date(slot.startTime).toLocaleDateString([], { month: "short", day: "numeric" })}</strong> · {new Date(slot.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{slot.status}</span>
                    {slot.status === "open" ? <button type="button" disabled={busy === slot.id} onClick={() => void removeSlot(slot.id)} className="font-semibold text-[#8B1E3F]">Remove</button> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#001F3F]">Upcoming sessions</h2>
            <div className="mt-5 space-y-4">
              {upcoming.length ? upcoming.map((booking) => (
                <BookingRow key={booking.id} booking={booking} role={user?.role ?? "student"} busy={busy} onUpdate={updateBooking} />
              )) : <EmptyState title="No upcoming sessions" body={user?.role === "student" ? "Browse tutors to request an available time." : "Student requests will appear here."} />}
            </div>
          </section>

          {history.length ? (
            <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#001F3F]">History</h2>
              <div className="mt-5 space-y-4">{history.map((booking) => <BookingRow key={booking.id} booking={booking} role={user?.role ?? "student"} busy={busy} onUpdate={updateBooking} />)}</div>
            </section>
          ) : null}
        </div>
      </main>
    </ProtectedPage>
  );
}

function BookingRow({ booking, role, busy, onUpdate }: { booking: Booking; role: string; busy: string; onUpdate: (id: string, status: "confirmed" | "completed" | "cancelled") => Promise<void> }) {
  const counterpart = role === "student" ? booking.tutorName : booking.studentName;
  const mutable = !["completed", "cancelled"].includes(booking.status);
  return (
    <div className="rounded-lg border border-gray-200 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#001F3F]">{booking.subjectName} with {counterpart}</p>
            <span className="rounded-full bg-[#001F3F]/5 px-2.5 py-1 text-xs font-semibold capitalize text-[#001F3F]">{booking.status}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{new Date(booking.startTime).toLocaleString([], { dateStyle: "full", timeStyle: "short" })}</p>
          {booking.notes ? <p className="mt-1 text-sm text-gray-500">{booking.notes}</p> : null}
        </div>
        {mutable ? (
          <div className="flex flex-wrap gap-2">
            {role === "tutor" && booking.status === "requested" ? <button className={primaryButtonClass} disabled={Boolean(busy)} onClick={() => void onUpdate(booking.id, "confirmed")}>Confirm</button> : null}
            {role === "tutor" && booking.status === "confirmed" ? <button className={primaryButtonClass} disabled={Boolean(busy)} onClick={() => void onUpdate(booking.id, "completed")}>Mark complete</button> : null}
            <button className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => void onUpdate(booking.id, "cancelled")}>Cancel</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
