import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO IMAGE WITH SMALL SENTENCE INSIDE */}
      <section className="relative w-full h-[90vh] overflow-hidden">
        <Image
          src="/images/hero-tutors.jpg"
          alt="Hero"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Larger cliché line, shifted slightly lower-right from center */}
        <div className="absolute z-10"
          style={{
            top: "60%",      // slightly below center
            left: "70%",     // slightly to the right of center
            transform: "translate(-50%, -50%)"
          }}>
          <p className="text-white text-5xl font-semibold leading-tight drop-shadow-[0_5px_12px_rgba(0,0,0,0.55)]">
            Guiding students.<br />
            <span className="inline-block pl-20 whitespace-nowrap">
              Empowering futures.
            </span>
          </p>
        </div>

      </section>


      {/* HERO HEADLINE + SUBHEADLINE + CTA BELOW IMAGE */}
      <section className="text-center px-6 max-w-3xl mx-auto mt-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#001F3F]">
          Ivy-League Tutors for High-Achieving Students.
        </h1>

        <p className="mt-6 text-lg text-gray-700">
          Personalized 1:1 tutoring with students from Brown, UPenn,
          Princeton, Harvard, and more.
        </p>

        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScBTd-fMie2BziRNCEUAjYahEt3zwujy0maNvyJ4XsheYSUbQ/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 bg-[#E63946] text-white font-semibold rounded-lg px-6 py-3 text-lg shadow-md hover:bg-[#d52f3c] transition"
        >
          Get Matched With a Tutor
        </a>
      </section>


      {/* KEY VALUE POINTS SECTION (unchanged) */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 px-6 text-center">

          {/* 1 — Top Ivy Tutors */}
          <div>
            <h3 className="text-xl font-semibold text-[#001F3F]">
              Top Ivy Tutors
            </h3>
            <p className="mt-3 text-gray-600">
              Mentors currently studying at Brown, UPenn, Princeton, Harvard,
              and more.
            </p>
          </div>

          {/* 2 — Flexible Scheduling */}
          <div>
            <h3 className="text-xl font-semibold text-[#001F3F]">
              Flexible Scheduling
            </h3>
            <p className="mt-3 text-gray-600">
              Online sessions that fit your child’s routine — no commuting stress.
            </p>
          </div>

          {/* 3 — Premium Results */}
          <div>
            <h3 className="text-xl font-semibold text-[#001F3F]">
              Premium Results
            </h3>
            <p className="mt-3 text-gray-600">
              Advanced academic support, competition prep, and top-tier guidance.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
