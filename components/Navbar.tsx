import Link from "next/link";

export default function Navbar() {
  const ACCENT = "#8B1E3F"; // muted Penn-style crimson

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
          <div className="flex items-center gap-6">
            <Link
              href="/tutors"
              className="text-base font-semibold tracking-wide text-white/80 hover:text-white transition"
            >
              Tutors
            </Link>

            {/* structural divider */}
            <span className="h-6 w-px bg-white/15" aria-hidden="true" />

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScBTd-fMie2BziRNCEUAjYahEt3zwujy0maNvyJ4XsheYSUbQ/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white transition"
              style={{ backgroundColor: ACCENT }}
            >
              Get Matched
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
