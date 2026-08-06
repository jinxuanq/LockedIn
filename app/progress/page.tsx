"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import WorkspaceNav from "@/components/WorkspaceNav";
import { useAuth } from "@/components/AuthProvider";
import { EmptyState, PageHeader, inputClass, primaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { Subject } from "@/lib/types";

interface ProgressEntry {
  id: string;
  summary: string;
  nextSteps: string;
  mastery: number;
  createdAt: string;
  tutorName: string;
}

interface Goal {
  id: string;
  studentName: string;
  tutorName: string;
  subjectName: string;
  title: string;
  description: string;
  status: string;
  targetDate: string | null;
  entries: ProgressEntry[];
}

interface StudentOption { id: string; name: string; email: string }

export default function ProgressPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tutorSubjectIds, setTutorSubjectIds] = useState<string[]>([]);
  const [goalForm, setGoalForm] = useState({ studentId: "", subjectId: "", title: "", description: "", targetDate: "" });
  const [entryForm, setEntryForm] = useState({ goalId: "", summary: "", nextSteps: "", mastery: "3" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(async () => {
    const data = await apiFetch<{ goals: Goal[]; students: StudentOption[]; subjects: Subject[] }>("/api/curriculum");
    setGoals(data.goals);
    setStudents(data.students);
    setSubjects(data.subjects);
    setGoalForm((current) => ({ ...current, studentId: current.studentId || data.students[0]?.id || "", subjectId: current.subjectId || data.subjects[0]?.id || "" }));
    setEntryForm((current) => ({ ...current, goalId: current.goalId || data.goals[0]?.id || "" }));
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh().catch((caught) => setError(caught.message));
    if (user.role === "tutor") {
      apiFetch<{ profile: { subjectIds: string[] } }>("/api/profile").then((data) => {
        setTutorSubjectIds(data.profile.subjectIds);
        setGoalForm((current) => ({
          ...current,
          subjectId: data.profile.subjectIds.includes(current.subjectId)
            ? current.subjectId
            : data.profile.subjectIds[0] ?? "",
        }));
      });
    }
  }, [user, refresh]);

  async function createGoal(event: FormEvent) {
    event.preventDefault();
    setBusy("goal"); setError("");
    try {
      await apiFetch("/api/curriculum", { method: "POST", body: JSON.stringify({ ...goalForm, targetDate: goalForm.targetDate || null }) });
      setGoalForm((current) => ({ ...current, title: "", description: "", targetDate: "" }));
      await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create goal."); }
    finally { setBusy(""); }
  }

  async function addEntry(event: FormEvent) {
    event.preventDefault();
    setBusy("entry"); setError("");
    try {
      await apiFetch("/api/curriculum/entries", { method: "POST", body: JSON.stringify({ ...entryForm, bookingId: null }) });
      setEntryForm((current) => ({ ...current, summary: "", nextSteps: "", mastery: "3" }));
      await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not add progress update."); }
    finally { setBusy(""); }
  }

  const availableSubjects = user?.role === "tutor" ? subjects.filter((subject) => tutorSubjectIds.includes(subject.id)) : subjects;

  return (
    <ProtectedPage roles={["student", "tutor"]}>
      <WorkspaceNav />
      <main className="min-h-[72vh] bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <PageHeader eyebrow="Curriculum tracking" title="Goals and progress" description={user?.role === "tutor" ? "Turn each tutoring relationship into a clear plan, then record evidence of growth after sessions." : "Review the goals, session notes, and next steps you share with your tutor."} />
          {error ? <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {user?.role === "tutor" ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <form onSubmit={createGoal} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#001F3F]">Create a curriculum goal</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-[#001F3F]">Student <select className={inputClass} value={goalForm.studentId} onChange={(event) => setGoalForm({ ...goalForm, studentId: event.target.value })} required><option value="">Select student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
                  <label className="text-sm font-semibold text-[#001F3F]">Subject <select className={inputClass} value={goalForm.subjectId} onChange={(event) => setGoalForm({ ...goalForm, subjectId: event.target.value })} required><option value="">Select subject</option>{availableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
                </div>
                <label className="mt-4 block text-sm font-semibold text-[#001F3F]">Goal title <input className={inputClass} value={goalForm.title} onChange={(event) => setGoalForm({ ...goalForm, title: event.target.value })} required /></label>
                <label className="mt-4 block text-sm font-semibold text-[#001F3F]">Description <textarea className={`${inputClass} min-h-24`} value={goalForm.description} onChange={(event) => setGoalForm({ ...goalForm, description: event.target.value })} /></label>
                <label className="mt-4 block text-sm font-semibold text-[#001F3F]">Target date <input className={inputClass} type="date" value={goalForm.targetDate} onChange={(event) => setGoalForm({ ...goalForm, targetDate: event.target.value })} /></label>
                <button className={`${primaryButtonClass} mt-5`} disabled={busy === "goal" || !students.length}>{busy === "goal" ? "Creating…" : "Create goal"}</button>
              </form>

              <form onSubmit={addEntry} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#001F3F]">Post a progress update</h2>
                <label className="mt-5 block text-sm font-semibold text-[#001F3F]">Curriculum goal <select className={inputClass} value={entryForm.goalId} onChange={(event) => setEntryForm({ ...entryForm, goalId: event.target.value })} required><option value="">Select goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.studentName} · {goal.title}</option>)}</select></label>
                <label className="mt-4 block text-sm font-semibold text-[#001F3F]">Session summary <textarea className={`${inputClass} min-h-24`} value={entryForm.summary} onChange={(event) => setEntryForm({ ...entryForm, summary: event.target.value })} required /></label>
                <label className="mt-4 block text-sm font-semibold text-[#001F3F]">Next steps <textarea className={`${inputClass} min-h-20`} value={entryForm.nextSteps} onChange={(event) => setEntryForm({ ...entryForm, nextSteps: event.target.value })} /></label>
                <label className="mt-4 block text-sm font-semibold text-[#001F3F]">Current mastery <select className={inputClass} value={entryForm.mastery} onChange={(event) => setEntryForm({ ...entryForm, mastery: event.target.value })}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>
                <button className={`${primaryButtonClass} mt-5`} disabled={busy === "entry" || !goals.length}>{busy === "entry" ? "Posting…" : "Post update"}</button>
              </form>
            </div>
          ) : null}

          <section className="mt-8 space-y-6">
            {goals.map((goal) => (
              <article key={goal.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B1E3F]">{goal.subjectName} · {user?.role === "student" ? goal.tutorName : goal.studentName}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#001F3F]">{goal.title}</h2>
                    {goal.description ? <p className="mt-2 text-gray-600">{goal.description}</p> : null}
                  </div>
                  <span className="rounded-full bg-[#001F3F]/5 px-3 py-1 text-xs font-semibold capitalize text-[#001F3F]">{goal.status}</span>
                </div>
                {goal.targetDate ? <p className="mt-4 text-sm text-gray-500">Target: {new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString([], { dateStyle: "medium" })}</p> : null}
                <div className="mt-6 border-l-2 border-[#8B1E3F]/20 pl-5">
                  {goal.entries.length ? goal.entries.map((entry) => (
                    <div key={entry.id} className="border-b border-gray-100 py-4 first:pt-0 last:border-0">
                      <div className="flex items-center justify-between gap-3"><p className="font-semibold text-[#001F3F]">{entry.summary}</p><span className="whitespace-nowrap text-xs font-semibold text-[#8B1E3F]">Mastery {entry.mastery}/5</span></div>
                      {entry.nextSteps ? <p className="mt-2 text-sm text-gray-600"><strong>Next:</strong> {entry.nextSteps}</p> : null}
                      <p className="mt-2 text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString([], { dateStyle: "medium" })} · {entry.tutorName}</p>
                    </div>
                  )) : <p className="py-2 text-sm text-gray-500">No progress entries yet.</p>}
                </div>
              </article>
            ))}
            {!goals.length ? <EmptyState title="No curriculum goals yet" body={user?.role === "student" ? "Your tutor can create a goal after your first session." : "Create a goal for one of your matched students."} /> : null}
          </section>
        </div>
      </main>
    </ProtectedPage>
  );
}
