import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#001F3F] border-t border-[#001F3F] mt-20">
      <div className="max-w-5xl mx-auto px-6 py-10 text-white/70">

        {/* Company Name */}
        <div className="text-xl font-semibold text-white/80">
          LockedIn
        </div>

        {/* Contact */}
        <p className="mt-3">
          Contact us:{" "}
          <a href="mailto:contact@example.com" className="hover:text-white transition">
            contact@example.com
          </a>
        </p>

        {/* Socials (placeholder) */}
        <div className="mt-4 flex gap-4">
          {/* Replace with real links later */}
          <Link href="#" className="hover:text-white transition">Instagram</Link>
          <Link href="#" className="hover:text-white transition">LinkedIn</Link>
          <Link href="#" className="hover:text-white transition">Twitter</Link>
        </div>

        {/* Privacy policy */}
        <div className="mt-6">
          <Link href="/privacy-policy" className="hover:text-white transition">
            Privacy Policy
          </Link>
        </div>

        {/* Bottom small text */}
        <p className="mt-6 text-sm text-white/50">
          © {new Date().getFullYear()} LockedIn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
