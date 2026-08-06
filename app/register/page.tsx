"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { inputClass, primaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { SafeUser, UserRole } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as Exclude<UserRole, "admin"> });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const result = await apiFetch<{
        user: SafeUser;
        requiresEmailConfirmation: boolean;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (result.requiresEmailConfirmation) {
        setNotice("Account created. Check your email to confirm it, then sign in.");
        return;
      }
      await refresh();
      router.push("/profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-xl sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E3F]">Join LockedIn</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#001F3F]">Create your account</h1>
        <p className="mt-3 text-gray-600">Choose the workspace that matches how you will use the platform.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {(["student", "tutor"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((current) => ({ ...current, role }))}
                className={`rounded-lg border px-4 py-3 text-sm font-semibold capitalize ${
                  form.role === role ? "border-[#8B1E3F] bg-[#8B1E3F]/5 text-[#8B1E3F]" : "border-gray-300 text-gray-600"
                }`}
              >
                I’m a {role}
              </button>
            ))}
          </div>
          <label className="block text-sm font-semibold text-[#001F3F]">
            Full name
            <input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-[#001F3F]">
            Email
            <input className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-[#001F3F]">
            Password
            <input className={inputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <span className="mt-2 block text-xs font-normal text-gray-500">At least 8 characters with uppercase, lowercase, and a number.</span>
          </label>
          {form.role === "tutor" ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">New tutor profiles remain private until an administrator approves them.</p>
          ) : null}
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {notice ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}
          <button className={`${primaryButtonClass} w-full`} disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">Already have an account? <Link href="/login" className="font-semibold text-[#8B1E3F]">Sign in</Link></p>
      </section>
    </main>
  );
}
