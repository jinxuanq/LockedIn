import Image from "next/image";

export default function HomePage() {
  // Muted Penn-like accent (use sparingly)
  const ACCENT = "#8B1E3F"; // muted crimson

  return (
    <main className="min-h-screen bg-white text-[#001F3F]">
      {/* HERO: same image + navy overlay, institutional + compact */}
      <section className="relative w-full h-[78vh] overflow-hidden">
        <Image
          src="/images/hero-tutors.jpg"
          alt="Students studying outdoors"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Navy overlay for legibility */}
        <div className="absolute inset-0 bg-[#001F3F]/60" />

        {/* Hero content */}
        <div className="absolute inset-0 z-10">
          <div className="mx-auto h-full max-w-6xl px-6 flex items-end pb-16">
            <div className="max-w-2xl">
              <p className="text-white/85 text-sm tracking-wide uppercase">
                An academic tutoring collective
              </p>

              <h1 className="mt-3 text-white text-4xl sm:text-5xl font-semibold leading-tight">
                Personalized academic support from current Ivy League students.
              </h1>

              <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
                One-on-one tutoring for middle and high school students across core academics,
                enrichment, and structured preparation.
              </p>

              {/* Quiet CTAs (no JS handlers; compiles as Server Component) */}
              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScBTd-fMie2BziRNCEUAjYahEt3zwujy0maNvyJ4XsheYSUbQ/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-white/70 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.7)" }}
                // muted red accent on hover via underline + subtle border tint using ring
                >
                  Request a match
                </a>

                <a
                  href="#model"
                  className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:text-white hover:underline underline-offset-4"
                  style={{ textDecorationColor: ACCENT }}
                >
                  How the model works →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AT A GLANCE: cardified + scannable + bullets (NO dots) */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: "Who we work with",
                title: "Middle & high school students",
                desc: "Support for core academics, enrichment, and students who want structured progress.",
                bullets: ["Coursework support and skill-building", "Advanced placement & honors pacing"],
              },
              {
                label: "Who teaches",
                title: "Current Ivy League undergraduates",
                desc: "Tutors are selected for subject mastery, clarity, and a student-centered approach.",
                bullets: ["Strong academic foundation", "Communication and patience"],
              },
              {
                label: "How it works",
                title: "Matched for fit + continuity",
                desc: "One-on-one online tutoring with flexible scheduling and pay-per-session options.",
                bullets: ["Short intake + follow-up", "Begin with a consistent tutor"],
              },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-8">
                <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                  {card.label}
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-[#001F3F] leading-snug">
                  {card.title}
                </h2>

                <div
                  className="mt-4 h-px w-16"
                  style={{ backgroundColor: "#8B1E3F", opacity: 0.35 }}
                  aria-hidden="true"
                />

                <p className="mt-5 text-gray-700 leading-relaxed">{card.desc}</p>

                <ul className="mt-6 space-y-3 text-sm text-gray-700 list-disc pl-5 marker:text-[#8B1E3F]">
                  {card.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* PROGRAM DETAILS STRIP: keep only first 3 tiles (bigger, easier to read) */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { k: "Format", v: "1:1 online" },
              { k: "Grades", v: "Middle & High" },
              { k: "Focus", v: "Core academics" },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-lg border border-gray-200 bg-white px-5 py-4"
              >
                <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                  {item.k}
                </p>
                <p className="mt-1 text-base font-semibold text-[#001F3F]">
                  {item.v}
                </p>
                <div
                  className="mt-3 h-0.5 w-10"
                  style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODEL: timeline / rail feel using cards (unchanged structure, light accent) */}
      <section id="model" className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-wide uppercase text-gray-500">
              Our tutoring model
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#001F3F]">
              Built for clarity, structure, and steady progress.
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed max-w-prose">
              We begin by understanding the student’s goals and constraints, then match for teaching
              style and continuity. Sessions emphasize fundamentals, reasoning, and confidence.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                step: "Step 01",
                title: "Academic intake",
                body: "A short intake form and follow-up to understand background, goals, and scheduling needs.",
                label: "Includes",
                chips: ["Goals", "Course level", "Availability"],
              },
              {
                step: "Step 02",
                title: "Tutor matching",
                body: "Students are paired based on expertise, teaching approach, and personality fit.",
                label: "Matching criteria",
                chips: ["Subject fit", "Teaching style", "Continuity"],
              },
              {
                step: "Step 03",
                title: "Ongoing instruction",
                body: "One-on-one online sessions with flexible scheduling and a consistent tutor over time.",
                label: "Session structure",
                chips: ["Fundamentals", "Reasoning", "Confidence"],
              },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                    {s.step}
                  </p>
                  <span className="text-xs font-semibold text-[#001F3F]">{s.title}</span>
                </div>

                <div
                  className="mt-3 h-px w-16"
                  style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                  aria-hidden="true"
                />

                <p className="mt-3 text-gray-700 leading-relaxed">{s.body}</p>

                <div className="mt-4">
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                    {s.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.chips.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-[#001F3F]"
                        style={{ backgroundColor: "rgba(139,30,63,0.04)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-gray-600 italic">
            From first message to first lesson—we keep it straightforward.
          </p>
        </div>
      </section>

      {/* ABOUT: 2-column editorial with sidebar details box (reuses working code, adds muted red accents) */}
      <section className="py-14 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main column */}
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold tracking-wide uppercase text-gray-500">
                About the program
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#001F3F]">
                Academic support, approached thoughtfully.
              </h2>

              <p className="mt-5 text-gray-700 leading-relaxed max-w-prose">
                We are a group of current Ivy League students committed to providing thoughtful,
                high-quality academic support for motivated learners. Drawing from our own academic
                experiences, we emphasize clarity, patience, and structured instruction. Our goal is
                to make rigorous academic guidance accessible, effective, and personal.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border-t border-gray-200 pt-5">
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Instructional focus
                  </p>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    Clear explanations, strong fundamentals, and independent problem-solving.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Communication & materials
                  </p>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    Consistent expectations, structured sessions, and follow-ups when helpful.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Program details
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#001F3F]">Subjects</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Math", "Science", "English", "Writing", "History", "CS"].map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-[#001F3F]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                        Format
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#001F3F]">1:1 online</p>
                      <div
                        className="mt-3 h-0.5 w-10"
                        style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                        Scheduling
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#001F3F]">Flexible</p>
                      <div
                        className="mt-3 h-0.5 w-10"
                        style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div
                    className="rounded-lg border p-4"
                    style={{
                      backgroundColor: "rgba(139,30,63,0.06)",
                      borderColor: "rgba(139,30,63,0.18)",
                    }}
                  >
                    <p className="text-sm font-semibold text-[#001F3F]">Start here</p>
                    <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                      Submit a short intake form. We’ll follow up to confirm goals and availability,
                      then introduce a matched tutor.
                    </p>
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLScBTd-fMie2BziRNCEUAjYahEt3zwujy0maNvyJ4XsheYSUbQ/viewform?usp=header"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm font-semibold hover:underline"
                      style={{ color: ACCENT }}
                    >
                      Request a match →
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* PARENT FEEDBACK: muted red accent bar */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-wide uppercase text-gray-500">
              Parent feedback
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#001F3F]">
              What families share with us
            </h2>
          </div>

          <div className="mt-10 max-w-3xl border-l-4 pl-6" style={{ borderLeftColor: ACCENT }}>
            <p className="text-lg text-gray-700 leading-relaxed italic">
              “Our daughter raised her math grade from a B to an A in just one month. The mentors
              were patient, knowledgeable, and genuinely invested in her progress.”
            </p>
            <p className="mt-4 text-gray-600">— Parent in New Jersey</p>
          </div>
        </div>
      </section>
    </main>
  );
}
