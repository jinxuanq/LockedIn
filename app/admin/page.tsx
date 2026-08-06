"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import WorkspaceNav from "@/components/WorkspaceNav";
import { PageHeader, secondaryButtonClass } from "@/components/Ui";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/client";

interface AdminTutor {
  id: string;
  name: string;
  email: string;
  school: string;
  headline: string;
  approved: number;
  hourlyRate: number;
  subjectIds: string[];
}

interface AdminInquiry {
  id: string;
  studentName: string;
  assignedTutorId: string | null;
  assignedTutorName: string | null;
  requestedTutorName: string | null;
  subjectName: string;
  subjectId: string;
  goals: string;
  status: "new" | "matched" | "closed";
  createdAt: string;
}

interface AdminData {
  counts: { students: number; tutors: number; pendingTutors: number; openInquiries: number; activeBookings: number };
  tutors: AdminTutor[];
  inquiries: AdminInquiry[];
}

export default function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(async () => setData(await apiFetch<AdminData>("/api/admin")), []);
  useEffect(() => { if (user?.role === "admin") refresh().catch((caught) => setError(caught.message)); }, [user, refresh]);

  async function approve(tutorId: string, approved: boolean) {
    setBusy(tutorId); setError("");
    try {
      setData(await apiFetch<AdminData>("/api/admin", { method: "PATCH", body: JSON.stringify({ tutorId, approved }) }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update tutor."); }
    finally { setBusy(""); }
  }

  async function updateInquiry(inquiryId: string, assignedTutorId: string | null, status: string) {
    setBusy(inquiryId); setError("");
    try {
      await apiFetch(`/api/inquiries/${inquiryId}`, { method: "PATCH", body: JSON.stringify({ assignedTutorId, status }) });
      await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update inquiry."); }
    finally { setBusy(""); }
  }

  return (
    <ProtectedPage roles={["admin"]}>
      <WorkspaceNav />
      <main className="min-h-[72vh] bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <PageHeader eyebrow="Operations" title="Admin dashboard" description="Approve tutor profiles, monitor platform activity, and route student inquiries." />
          {error ? <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {!data ? <p className="mt-10 text-gray-500">Loading administration data…</p> : (
            <>
              <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Object.entries(data.counts).map(([key, value]) => <div key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{key.replace(/([A-Z])/g, " $1")}</p><p className="mt-2 text-3xl font-semibold text-[#001F3F]">{value}</p></div>)}
              </section>

              <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#001F3F]">Tutor approvals</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><tr><th className="pb-3">Tutor</th><th className="pb-3">School</th><th className="pb-3">Rate</th><th className="pb-3">Status</th><th className="pb-3 text-right">Action</th></tr></thead>
                    <tbody>{data.tutors.map((tutor) => <tr key={tutor.id} className="border-b border-gray-100 last:border-0"><td className="py-4"><p className="font-semibold text-[#001F3F]">{tutor.name}</p><p className="text-xs text-gray-500">{tutor.email}</p></td><td className="py-4 text-gray-600">{tutor.school || "Incomplete"}</td><td className="py-4 text-gray-600">${tutor.hourlyRate}/hr</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tutor.approved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{tutor.approved ? "Approved" : "Pending"}</span></td><td className="py-4 text-right"><button className={secondaryButtonClass} disabled={busy === tutor.id} onClick={() => void approve(tutor.id, !tutor.approved)}>{tutor.approved ? "Hide" : "Approve"}</button></td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#001F3F]">Inquiry routing</h2>
                <div className="mt-5 space-y-4">
                  {data.inquiries.map((inquiry) => (
                    <article key={inquiry.id} className="rounded-lg border border-gray-200 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B1E3F]">{inquiry.subjectName} · {inquiry.status}</p>
                          <h3 className="mt-2 font-semibold text-[#001F3F]">{inquiry.studentName}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">{inquiry.goals}</p>
                          {inquiry.requestedTutorName ? <p className="mt-2 text-xs text-gray-500">Requested {inquiry.requestedTutorName}</p> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={inquiry.assignedTutorId ?? ""} onChange={(event) => void updateInquiry(inquiry.id, event.target.value || null, event.target.value ? "matched" : "new")} disabled={busy === inquiry.id}>
                            <option value="">Unassigned</option>
                            {data.tutors.filter((tutor) => tutor.approved && tutor.subjectIds.includes(inquiry.subjectId)).map((tutor) => <option key={tutor.id} value={tutor.id}>{tutor.name}</option>)}
                          </select>
                          {inquiry.status !== "closed" ? <button className={secondaryButtonClass} disabled={busy === inquiry.id} onClick={() => void updateInquiry(inquiry.id, inquiry.assignedTutorId, "closed")}>Close</button> : <button className={secondaryButtonClass} disabled={busy === inquiry.id} onClick={() => void updateInquiry(inquiry.id, inquiry.assignedTutorId, inquiry.assignedTutorId ? "matched" : "new")}>Reopen</button>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}
