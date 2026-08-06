import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#001F3F] border-t border-[#001F3F] mt-20">
      <div className="max-w-5xl mx-auto px-6 py-10 text-white/70">

        {/* Company Name */}
        <div className="text-xl font-semibold text-white/80">
          LockedIn Tutoring
        </div>

        {/* Contact */}
        <p className="mt-3">
          Contact us:{" "}
          <a href="mailto:lockedin4contact@gmail.com" className="hover:text-white transition">
          lockedin4contact@gmail.com
          </a>
        </p>


        {/* Privacy policy */}
        <div className="mt-6">
          <Link href="/how-it-works" className="hover:text-white transition">
            How it works
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
