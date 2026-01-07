import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#001F3F] border-b border-[#001F3F]">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">

        <Link href="/" className="text-xl font-semibold text-white/80">
          LockedIn
        </Link>

        <div className="flex items-center gap-6 text-lg text-white/70 ml-8">
          <Link href="/about" className="hover:text-white transition">
            About
          </Link>
          <Link href="/tutors" className="hover:text-white transition">
            Tutors
          </Link>
          <Link href="/pricing" className="hover:text-white transition">
            Pricing
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition">
            How It Works
          </Link>

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScBTd-fMie2BziRNCEUAjYahEt3zwujy0maNvyJ4XsheYSUbQ/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "#E63946" }}
          >
            Get Started
          </a>
        </div>

      </div>
    </nav>
  );
}