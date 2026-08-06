"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { primaryButtonClass, secondaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { TutorSummary } from "@/lib/types";

interface Availability {
  id: string;
  startTime: string;
  endTime: string;
}

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [tutor, setTutor] = useState<TutorSummary | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    apiFetch<{ tutor: TutorSummary; availability: Availability[] }>(`/api/tutors/${id}`)
      .then((data) => {
        setTutor(data.tutor);
        setAvailability(data.availability);
        setSubjectId(data.tutor.subjects[0]?.id ?? "");
      })
      .catch((caught) => setError(caught.message));
  }, [id]);

  async function book(slotId: string) {
    if (!user) { router.push("/login"); return; }
    setBusy(slotId);
    setError("");
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ tutorId: id, subjectId, availabilitySlotId: slotId, notes: "Requested from tutor profile" }),
      });
      router.push("/schedule");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not request session.");
    } finally {
      setBusy("");
    }
  }

  async function messageTutor() {
    if (!user) { router.push("/login"); return; }
    setBusy("message");
    try {
      const data = await apiFetch<{ conversation: { id: string } }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ userId: id }),
      });
      router.push(`/messages?conversation=${data.conversation.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open chat.");
    } finally {
      setBusy("");
    }
  }

  if (!tutor) return <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-20 text-gray-600">{error || "Loading tutor profile…"}</main>;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <Link href="/tutors" className="text-sm font-semibold text-[#8B1E3F]">← Back to tutors</Link>
        <div className="mt-6 grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-96 bg-gray-100"><Image src={tutor.image} alt={tutor.name} fill className="object-cover" priority /></div>
          <section className="p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E3F]">Approved tutor</p>
            <h1 className="mt-3 text-4xl font-semibold text-[#001F3F]">{tutor.name} <span className="text-lg font-normal text-gray-500">({tutor.pronouns})</span></h1>
            <p className="mt-2 text-gray-600">{tutor.school}</p>
            <p className="mt-6 text-xl font-semibold text-[#001F3F]">{tutor.headline}</p>
            <p className="mt-4 leading-relaxed text-gray-700">{tutor.bio}</p>
            <div className="mt-6 flex flex-wrap gap-2">{tutor.subjects.map((subject) => <span key={subject.id} className="rounded-full bg-[#8B1E3F]/5 px-3 py-1.5 text-sm font-semibold text-[#001F3F]">{subject.name}</span>)}</div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={`/intake?tutor=${tutor.id}&subject=${subjectId}`} className={primaryButtonClass}>Send an inquiry</Link>
              <button type="button" onClick={() => void messageTutor()} disabled={busy === "message"} className={secondaryButtonClass}>{busy === "message" ? "Opening…" : "Message tutor"}</button>
              <span className="text-sm font-semibold text-gray-600">${tutor.hourlyRate}/hour</span>
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E3F]">Availability</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#001F3F]">Request a session</h2>
            </div>
            <label className="text-sm font-semibold text-[#001F3F]">Subject <select className="ml-2 rounded-md border border-gray-300 px-3 py-2" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>{tutor.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          </div>
          {error ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availability.length ? availability.map((slot) => (
              <button key={slot.id} type="button" onClick={() => void book(slot.id)} disabled={Boolean(busy) || user?.role !== "student"} className="rounded-lg border border-gray-200 p-4 text-left transition hover:border-[#8B1E3F] disabled:cursor-not-allowed disabled:opacity-50">
                <span className="block font-semibold text-[#001F3F]">{new Date(slot.startTime).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</span>
                <span className="mt-1 block text-sm text-gray-600">{new Date(slot.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–{new Date(slot.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                <span className="mt-3 block text-xs font-semibold text-[#8B1E3F]">{busy === slot.id ? "Requesting…" : "Request this time →"}</span>
              </button>
            )) : <p className="text-gray-600">No open times are listed yet. Send an inquiry to coordinate directly.</p>}
          </div>
          {user?.role && user.role !== "student" ? <p className="mt-5 text-sm text-gray-500">Switch to a student account to request a session.</p> : null}
        </section>
      </div>
    </main>
  );
}
