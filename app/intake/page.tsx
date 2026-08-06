"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import { PageHeader, inputClass, primaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { Subject, TutorSummary } from "@/lib/types";

export default function IntakePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [requestedTutor, setRequestedTutor] = useState<TutorSummary | null>(null);
  const [form, setForm] = useState({ subjectId: "", goals: "", availabilityNotes: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tutorId = params.get("tutor");
    const subjectId = params.get("subject") ?? "";
    setForm((current) => ({ ...current, subjectId }));
    apiFetch<{ subjects: Subject[] }>("/api/subjects").then((data) => setSubjects(data.subjects));
    if (tutorId) {
      apiFetch<{ tutor: TutorSummary }>(`/api/tutors/${tutorId}`).then((data) => setRequestedTutor(data.tutor));
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await apiFetch<{ inquiry: { conversationId: string } }>("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({ ...form, requestedTutorId: requestedTutor?.id ?? null }),
      });
      router.push(`/messages?conversation=${data.inquiry.conversationId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedPage roles={["student"]}>
      <main className="min-h-[75vh] bg-gray-50 py-14">
        <div className="mx-auto max-w-3xl px-6">
          <PageHeader eyebrow="Student intake" title="Tell us what support would help." description="Your inquiry is routed to an approved tutor who covers the subject. A private conversation opens immediately so you can discuss fit and timing." />
          <form onSubmit={submit} className="mt-10 space-y-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
            {requestedTutor ? (
              <div className="rounded-lg border border-[#8B1E3F]/15 bg-[#8B1E3F]/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B1E3F]">Requested tutor</p>
                <p className="mt-1 font-semibold text-[#001F3F]">{requestedTutor.name} · {requestedTutor.school}</p>
              </div>
            ) : null}
            <label className="block text-sm font-semibold text-[#001F3F]">
              Subject
              <select className={inputClass} value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} required>
                <option value="">Select a subject</option>
                {subjects
                  .filter((subject) => !requestedTutor || requestedTutor.subjects.some((item) => item.id === subject.id))
                  .map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#001F3F]">
              Academic goals and current challenges
              <textarea className={`${inputClass} min-h-36`} value={form.goals} onChange={(event) => setForm({ ...form, goals: event.target.value })} placeholder="What are you working on? What would a successful month of tutoring look like?" required />
            </label>
            <label className="block text-sm font-semibold text-[#001F3F]">
              General availability
              <textarea className={`${inputClass} min-h-24`} value={form.availabilityNotes} onChange={(event) => setForm({ ...form, availabilityNotes: event.target.value })} placeholder="Example: Weekdays after 4 PM Eastern" />
            </label>
            {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            <button className={primaryButtonClass} disabled={submitting}>{submitting ? "Routing inquiry…" : "Submit inquiry and open chat"}</button>
          </form>
        </div>
      </main>
    </ProtectedPage>
  );
}
