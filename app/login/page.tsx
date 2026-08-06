"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { inputClass, primaryButtonClass } from "@/components/Ui";
import { apiFetch } from "@/lib/client";
import type { SafeUser } from "@/lib/types";

interface LocalPreviewAccount {
  label: string;
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewAccounts, setPreviewAccounts] = useState<LocalPreviewAccount[]>([]);

  useEffect(() => {
    void apiFetch<{ accounts: LocalPreviewAccount[] }>("/api/local-preview")
      .then(({ accounts }) => setPreviewAccounts(accounts))
      .catch(() => undefined);
  }, []);

  async function login(loginEmail: string, loginPassword: string) {
    setSubmitting(true);
    setError("");
    try {
      await apiFetch<{ user: SafeUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      await refresh();
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void login(email, password);
  }

  return (
    <main className="min-h-[75vh] bg-gray-50 px-6 py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl lg:grid-cols-2">
        <section className="bg-[#001F3F] p-8 text-white sm:p-12">
          {previewAccounts.length ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Workspace preview</p>
              <h1 className="mt-4 text-4xl font-semibold">Choose a workspace.</h1>
              <p className="mt-4 leading-relaxed text-white/75">
                Explore the student, tutor, and administrator workflows using local-only accounts.
              </p>
              <div className="mt-10 space-y-3">
                {previewAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={submitting}
                    onClick={() => void login(account.email, account.password)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/20 px-4 py-3 text-left font-semibold transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <span>{account.label}</span>
                    <span className="text-sm font-normal text-white/60">Open →</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">LockedIn Tutoring</p>
              <h1 className="mt-4 text-4xl font-semibold">Learn with the right person.</h1>
              <p className="mt-4 leading-relaxed text-white/75">
                Connect with a tutor, plan sessions, exchange messages, and keep academic progress organized in one place.
              </p>
            </>
          )}
        </section>

        <section className="p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E3F]">Account access</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#001F3F]">Sign in</h2>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold text-[#001F3F]">
              Email
              <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block text-sm font-semibold text-[#001F3F]">
              Password
              <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <button className={`${primaryButtonClass} w-full`} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-sm text-gray-600">
            New here? <Link href="/register" className="font-semibold text-[#8B1E3F]">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
