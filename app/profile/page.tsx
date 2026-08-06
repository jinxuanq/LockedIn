"use client";

import { FormEvent, useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import WorkspaceNav from "@/components/WorkspaceNav";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader, inputClass, primaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { Subject } from "@/lib/types";

type Profile = Record<string, unknown> & {
  id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  gradeLevel?: string;
  guardianName?: string;
  goals?: string;
  timezone?: string;
  pronouns?: string;
  school?: string;
  headline?: string;
  bio?: string;
  image?: string;
  hourlyRate?: number;
  approved?: boolean;
  subjectIds?: string[];
};

export default function ProfilePage() {
  const { user, refresh: refreshAuth } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ profile: Profile; subjects: Subject[] }>("/api/profile")
      .then((data) => { setProfile(data.profile); setSubjects(data.subjects); })
      .catch((caught) => setError(caught.message));
  }, [user]);

  function update(key: string, value: unknown) {
    setProfile((current) => current ? { ...current, [key]: value } : current);
  }

  function toggleSubject(id: string) {
    const current = profile?.subjectIds ?? [];
    update("subjectIds", current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const body = profile.role === "student" ? {
        name: profile.name,
        gradeLevel: profile.gradeLevel,
        guardianName: profile.guardianName,
        goals: profile.goals,
        timezone: profile.timezone,
      } : {
        name: profile.name,
        pronouns: profile.pronouns,
        school: profile.school,
        headline: profile.headline,
        bio: profile.bio,
        imageUrl: profile.image,
        hourlyRate: profile.hourlyRate,
        timezone: profile.timezone,
        subjectIds: profile.subjectIds,
      };
      const data = await apiFetch<{ profile: Profile; subjects: Subject[] }>("/api/profile", { method: "PUT", body: JSON.stringify(body) });
      setProfile(data.profile);
      await refreshAuth();
      setSuccess("Profile saved.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save profile."); }
    finally { setSaving(false); }
  }

  return (
    <ProtectedPage>
      <WorkspaceNav />
      <main className="min-h-[72vh] bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <PageHeader eyebrow="Account settings" title="Your profile" description="Keep the information used for matching, scheduling, and tutoring relationships current." />
          {!profile ? <p className="mt-10 text-gray-500">Loading profile…</p> : profile.role === "admin" ? (
            <section className="mt-10 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="font-semibold text-[#001F3F]">{profile.name}</p><p className="mt-1 text-gray-600">{profile.email}</p><p className="mt-4 text-sm text-gray-500">Administrator profiles are managed locally.</p>
            </section>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-6 rounded-xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
              {profile.role === "tutor" ? <p className={`rounded-md px-4 py-3 text-sm ${profile.approved ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>{profile.approved ? "Your profile is approved and visible in the directory." : "Your profile is awaiting administrator approval."}</p> : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#001F3F]">Full name <input className={inputClass} value={profile.name} onChange={(event) => update("name", event.target.value)} required /></label>
                <label className="text-sm font-semibold text-[#001F3F]">Email <input className={`${inputClass} bg-gray-50`} value={profile.email} disabled /></label>
              </div>
              {profile.role === "student" ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-[#001F3F]">Grade level <input className={inputClass} value={profile.gradeLevel ?? ""} onChange={(event) => update("gradeLevel", event.target.value)} required /></label>
                    <label className="text-sm font-semibold text-[#001F3F]">Parent/guardian name <input className={inputClass} value={profile.guardianName ?? ""} onChange={(event) => update("guardianName", event.target.value)} /></label>
                  </div>
                  <label className="block text-sm font-semibold text-[#001F3F]">Academic goals <textarea className={`${inputClass} min-h-32`} value={profile.goals ?? ""} onChange={(event) => update("goals", event.target.value)} required /></label>
                </>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-[#001F3F]">Pronouns <input className={inputClass} value={profile.pronouns ?? ""} onChange={(event) => update("pronouns", event.target.value)} /></label>
                    <label className="text-sm font-semibold text-[#001F3F]">School and class year <input className={inputClass} value={profile.school ?? ""} onChange={(event) => update("school", event.target.value)} required /></label>
                  </div>
                  <label className="block text-sm font-semibold text-[#001F3F]">Headline <input className={inputClass} value={profile.headline ?? ""} onChange={(event) => update("headline", event.target.value)} required /></label>
                  <label className="block text-sm font-semibold text-[#001F3F]">Biography <textarea className={`${inputClass} min-h-36`} value={profile.bio ?? ""} onChange={(event) => update("bio", event.target.value)} required /></label>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-[#001F3F]">Hourly rate <input className={inputClass} type="number" min="0" max="500" value={profile.hourlyRate ?? 55} onChange={(event) => update("hourlyRate", Number(event.target.value))} required /></label>
                    <label className="text-sm font-semibold text-[#001F3F]">Image path <input className={inputClass} value={profile.image ?? ""} onChange={(event) => update("image", event.target.value)} required /></label>
                  </div>
                  <fieldset><legend className="text-sm font-semibold text-[#001F3F]">Subjects</legend><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{subjects.map((subject) => <label key={subject.id} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"><input type="checkbox" checked={(profile.subjectIds ?? []).includes(subject.id)} onChange={() => toggleSubject(subject.id)} /> {subject.name}</label>)}</div></fieldset>
                </>
              )}
              <label className="block text-sm font-semibold text-[#001F3F]">Time zone <input className={inputClass} value={profile.timezone ?? "America/New_York"} onChange={(event) => update("timezone", event.target.value)} required /></label>
              {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
              {success ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p> : null}
              <button className={primaryButtonClass} disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
            </form>
          )}
          {!profile && error ? <p className="mt-4 text-red-700">{error}</p> : null}
        </div>
      </main>
    </ProtectedPage>
  );
}
