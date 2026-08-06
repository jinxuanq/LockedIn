"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { UserRole } from "@/lib/types";

export default function ProtectedPage({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-24 text-gray-600">Loading your workspace…</div>;
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E3F]">Account required</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#001F3F]">Sign in to continue</h1>
        <p className="mt-4 text-lg text-gray-600">This workspace keeps tutoring conversations and schedules private.</p>
        <Link href="/login" className="mt-8 inline-flex rounded-md bg-[#8B1E3F] px-5 py-3 font-semibold text-white">
          Sign in
        </Link>
      </main>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#001F3F]">This area is not available for your account.</h1>
        <Link href="/dashboard" className="mt-6 inline-flex font-semibold text-[#8B1E3F]">Return to dashboard →</Link>
      </main>
    );
  }
  return <>{children}</>;
}
