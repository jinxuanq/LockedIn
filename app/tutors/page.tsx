"use client";

import { useEffect, useMemo, useState } from "react";
import TutorCard from "@/components/TutorCard";
import { EmptyState, PageHeader, inputClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { Subject, TutorSummary } from "@/lib/types";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [maxRate, setMaxRate] = useState("100");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ subjects: Subject[] }>("/api/subjects").then((data) => setSubjects(data.subjects));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (subject) params.set("subject", subject);
      if (maxRate) params.set("maxRate", maxRate);
      apiFetch<{ tutors: TutorSummary[] }>(`/api/tutors?${params}`, { signal: controller.signal })
        .then((data) => { setTutors(data.tutors); setError(""); })
        .catch((caught) => { if (caught.name !== "AbortError") setError(caught.message); })
        .finally(() => setLoading(false));
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [q, subject, maxRate]);

  const categories = useMemo(() => Array.from(new Set(subjects.map((item) => item.category))), [subjects]);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <section className="border-b border-gray-200 bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <PageHeader eyebrow="Tutor directory" title="Find the right academic fit." description="Filter approved tutors by subject, specialty, or hourly rate, then send an inquiry or request an available time." />
          <div className="mt-9 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 md:grid-cols-[1.5fr_1fr_0.8fr]">
            <label className="text-sm font-semibold text-[#001F3F]">
              Search
              <input className={inputClass} value={q} onChange={(event) => setQ(event.target.value)} placeholder="Tutor, school, or specialty" />
            </label>
            <label className="text-sm font-semibold text-[#001F3F]">
              Subject
              <select className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option value="">All subjects</option>
                {categories.map((category) => (
                  <optgroup key={category} label={category}>
                    {subjects.filter((item) => item.category === category).map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[#001F3F]">
              Maximum rate
              <select className={inputClass} value={maxRate} onChange={(event) => setMaxRate(event.target.value)}>
                <option value="60">Up to $60/hr</option>
                <option value="75">Up to $75/hr</option>
                <option value="100">Up to $100/hr</option>
                <option value="">Any rate</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600"><span className="font-semibold text-[#001F3F]">{tutors.length}</span> approved tutors</p>
          {loading ? <span className="text-sm text-gray-500">Updating…</span> : null}
        </div>
        {error ? <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p> : null}
        {!loading && tutors.length === 0 ? <EmptyState title="No tutors match those filters" body="Try a different subject or broaden the rate range." /> : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)}
          </div>
        )}
      </section>
    </main>
  );
}
