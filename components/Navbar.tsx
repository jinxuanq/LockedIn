"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const ACCENT = "#8B1E3F"; // muted Penn-style crimson
  const { user, loading, logout } = useAuth();

  return (
    <nav className="w-full bg-[#001F3F] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-semibold tracking-wide text-white/90 hover:text-white transition"
          >
            LockedIn
          </Link>

          {/* Right-side nav */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/tutors"
              className="text-base font-semibold tracking-wide text-white/80 hover:text-white transition"
            >
              Tutors
            </Link>

            {!loading && user ? (
              <>
                <Link href="/dashboard" className="text-sm font-semibold text-white/80 hover:text-white">
                  Workspace
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="hidden text-sm font-semibold text-white/70 hover:text-white sm:inline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-semibold text-white/80 hover:text-white sm:inline">
                  Sign in
                </Link>
                <Link
                  href="/intake"
                  className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: ACCENT }}
                >
                  Get Matched
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
