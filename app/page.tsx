"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Reveal: subtle fade-up on scroll (guaranteed visible)
 * - Uses a two-step render (first paint hidden, then reveal on next frame)
 * - Respects prefers-reduced-motion
 */
function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      requestAnimationFrame(() => setShow(true));
      return;
    }

    const reveal = () => {
      requestAnimationFrame(() => {
        window.setTimeout(() => setShow(true), delayMs);
      });
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -12% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={[
        className,
        "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
        "transition-all duration-500 ease-out will-change-transform",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * UnderlineLink: micro-delight underline grows in from left on hover/focus
 * - Uses CSS variable --u for underline color
 */
function UnderlineLink({
  href,
  children,
  className = "",
  underlineColor,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  underlineColor: string;
}) {
  return (
    <a
      href={href}
      {...props}
      className={[
        "relative inline-flex items-center font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[var(--u)]",
        "after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out",
        "hover:after:scale-x-100 focus-visible:after:scale-x-100",
        className,
      ].join(" ")}
      style={{
        ...(props.style || {}),
        "--u": underlineColor,
      } as React.CSSProperties & { "--u": string }}
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  // Muted Penn-like accent (use sparingly)
  const ACCENT = "#8B1E3F"; // muted crimson
  const bodyText = "text-[17px] sm:text-[18px] text-gray-700 leading-relaxed";
  const smallLabel = "text-xs font-semibold tracking-wide uppercase text-gray-500";

  const cardBase = "relative rounded-xl border border-gray-200 bg-white";
  const cardMotion =
    "transition-all duration-300 ease-out " +
    "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.05] " +
    "motion-reduce:transform-none motion-reduce:transition-none";
  const cardWarmTint = "hover:bg-[rgba(139,30,63,0.025)]";
  const cardAccentRail =
    "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-l-xl " +
    "before:bg-[rgba(139,30,63,0.0)] hover:before:bg-[rgba(139,30,63,0.35)] " +
    "before:transition-colors before:duration-300";

  return (
    <main className="min-h-screen bg-white text-[#001F3F] [font-size:18px] leading-[1.7]">
      {/* HERO */}
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
            <Reveal className="max-w-2xl" delayMs={0}>
              <p className="text-white/85 text-sm tracking-wide uppercase">
                An academic tutoring collective
              </p>

              <h1 className="mt-3 text-white text-4xl sm:text-5xl font-semibold leading-tight">
                Personalized academic support from current Ivy League students.
              </h1>

              <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed max-w-prose">
                One-on-one tutoring for middle and high school students across core academics,
                enrichment, and structured preparation.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href="/intake"
                  className={[
                    "inline-flex items-center justify-center rounded-md border px-5 py-3",
                    "text-base font-semibold text-white",
                    "transition-all duration-300 ease-out",
                    "hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.20)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 focus-visible:ring-offset-[#001F3F]",
                    "motion-reduce:transition-none",
                  ].join(" ")}
                  style={{ borderColor: "rgba(255,255,255,0.7)" }}
                >
                  Request a match
                </a>

                <UnderlineLink
                  href="#model"
                  underlineColor={ACCENT}
                  className="text-white/90 hover:text-white px-1 py-1 rounded-md focus-visible:ring-white/60 focus-visible:ring-offset-[#001F3F]"
                >
                  How the model works →
                </UnderlineLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* AT A GLANCE (REPOSITIONED + SEPARATED)
          Fix: lower the anchored block so hero doesn’t feel cramped.
          - was: -mt-10 / sm:-mt-16
          - now: -mt-6 / sm:-mt-10 (less overlap)
          - also: add a touch more top padding inside the block on mobile to breathe
      */}
      <section className="-mt-6 sm:-mt-10 pb-10">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
              <div className="px-6 sm:px-10 pt-9 sm:pt-10 pb-6 sm:pb-8">
                <p className={smallLabel}>At a glance</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#001F3F]">
                  Clear structure. Calm execution. Real results.
                </h2>
                <div
                  className="mt-4 h-px w-20"
                  style={{ backgroundColor: ACCENT, opacity: 0.25 }}
                  aria-hidden="true"
                />
              </div>

              <div className="px-6 sm:px-10 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  ].map((card, idx) => (
                    <Reveal key={card.label} delayMs={idx * 90}>
                      <div className={[cardBase, cardMotion, cardWarmTint, cardAccentRail, "p-7"].join(" ")}>
                        <p className={smallLabel}>{card.label}</p>

                        <h3 className="mt-3 text-xl sm:text-2xl font-semibold text-[#001F3F] leading-snug">
                          {card.title}
                        </h3>

                        <div
                          className="mt-4 h-px w-16"
                          style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                          aria-hidden="true"
                        />

                        <p className={"mt-5 " + bodyText}>{card.desc}</p>

                        <ul className="mt-6 space-y-3 text-[17px] sm:text-[18px] text-gray-700 list-disc pl-5 marker:text-[#8B1E3F]">
                          {card.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRAM DETAILS STRIP */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { k: "Format", v: "1:1 online" },
                { k: "Grades", v: "Middle & High" },
                { k: "Focus", v: "Core academics" },
              ].map((item, idx) => (
                <Reveal key={item.k} delayMs={idx * 80}>
                  <div
                    className={[
                      "rounded-xl border border-gray-200 bg-white px-6 py-5",
                      "transition-all duration-300 ease-out",
                      "hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.03]",
                      "motion-reduce:transform-none motion-reduce:transition-none",
                    ].join(" ")}
                  >
                    <p className={smallLabel}>{item.k}</p>
                    <p className="mt-1 text-lg sm:text-xl font-semibold text-[#001F3F]">
                      {item.v}
                    </p>
                    <div
                      className="mt-3 h-0.5 w-12"
                      style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                      aria-hidden="true"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* MODEL */}
      <section id="model" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="max-w-3xl">
            <p className={smallLabel}>Our tutoring model</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#001F3F]">
              Built for clarity, structure, and steady progress.
            </h2>
            <p className={"mt-4 max-w-prose " + bodyText}>
              We begin by understanding the student’s goals and constraints, then match for teaching
              style and continuity. Sessions emphasize fundamentals, reasoning, and confidence.
            </p>
          </Reveal>

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
            ].map((s, idx) => (
              <Reveal key={s.step} delayMs={idx * 90}>
                <div className={[cardBase, cardMotion, cardWarmTint, cardAccentRail, "p-7"].join(" ")}>
                  <div className="flex items-center justify-between gap-4">
                    <p className={smallLabel}>{s.step}</p>
                    <span className="text-base font-semibold text-[#001F3F]">{s.title}</span>
                  </div>

                  <div
                    className="mt-4 h-px w-16"
                    style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                    aria-hidden="true"
                  />

                  <p className={"mt-4 " + bodyText}>{s.body}</p>

                  <div className="mt-5">
                    <p className={smallLabel}>{s.label}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.chips.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-[#001F3F] transition-colors duration-300"
                          style={{ backgroundColor: "rgba(139,30,63,0.05)" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={120} className="mt-10">
            <p className="text-[16px] sm:text-[17px] text-gray-600 italic">
              From first message to first lesson—we keep it straightforward.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main column */}
            <Reveal className="lg:col-span-7" delayMs={0}>
              <p className={smallLabel}>About the program</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#001F3F]">
                Academic support, approached thoughtfully.
              </h2>

              <p className={"mt-5 max-w-prose " + bodyText}>
                We are a group of current Ivy League students committed to providing thoughtful,
                high-quality academic support for motivated learners. Drawing from our own academic
                experiences, we emphasize clarity, patience, and structured instruction. Our goal is
                to make rigorous academic guidance accessible, effective, and personal.
              </p>

              <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Instructional focus",
                    body: "Clear explanations, strong fundamentals, and independent problem-solving.",
                  },
                  {
                    title: "Communication & materials",
                    body: "Consistent expectations, structured sessions, and follow-ups when helpful.",
                  },
                ].map((b, idx) => (
                  <Reveal key={b.title} delayMs={idx * 80}>
                    <div className="border-t border-gray-200 pt-5">
                      <p className={smallLabel}>{b.title}</p>
                      <p className={"mt-2 " + bodyText}>{b.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            {/* Sidebar */}
            <Reveal className="lg:col-span-5" delayMs={120}>
              <div className="rounded-xl border border-gray-200 bg-white p-7 transition-shadow duration-300 ease-out hover:shadow-xl motion-reduce:transition-none">
                <p className={smallLabel}>Program details</p>

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-lg font-semibold text-[#001F3F]">Subjects</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Math", "Science", "English", "Writing", "History", "CS"].map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-[#001F3F] transition-colors duration-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { k: "Format", v: "1:1 online" },
                      { k: "Scheduling", v: "Flexible" },
                    ].map((x) => (
                      <div
                        key={x.k}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-4 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        <p className={smallLabel}>{x.k}</p>
                        <p className="mt-1 text-base sm:text-lg font-semibold text-[#001F3F]">
                          {x.v}
                        </p>
                        <div
                          className="mt-3 h-0.5 w-12"
                          style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                          aria-hidden="true"
                        />
                      </div>
                    ))}
                  </div>

                  <div
                    className={[
                      "rounded-xl border p-5",
                      "transition-all duration-300 ease-out",
                      "hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]",
                      "motion-reduce:transform-none motion-reduce:transition-none",
                    ].join(" ")}
                    style={{
                      backgroundColor: "rgba(139,30,63,0.06)",
                      borderColor: "rgba(139,30,63,0.18)",
                    }}
                  >
                    <p className="text-lg font-semibold text-[#001F3F]">Start here</p>
                    <p className={"mt-1 " + bodyText}>
                      Submit a short intake form. We’ll follow up to confirm goals and availability,
                      then introduce a matched tutor.
                    </p>

                    <UnderlineLink
                      href="/intake"
                      underlineColor={ACCENT}
                      className="mt-3 text-[17px] sm:text-[18px] text-[#8B1E3F] rounded-md focus-visible:ring-[#8B1E3F]/40"
                    >
                      Request a match →
                    </UnderlineLink>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PARENT FEEDBACK */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="max-w-3xl">
            <p className={smallLabel}>Parent feedback</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-[#001F3F]">
              What families share with us
            </h2>
          </Reveal>

          <Reveal delayMs={120} className="mt-10 max-w-3xl">
            <div
              className={[
                "border-l-4 pl-6 py-3",
                "transition-all duration-300 ease-out",
                "hover:bg-[rgba(139,30,63,0.03)] hover:shadow-md hover:rounded-lg hover:-translate-y-0.5",
                "motion-reduce:transition-none",
              ].join(" ")}
              style={{ borderLeftColor: ACCENT }}
            >
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed italic">
                “Our daughter raised her math grade from a B to an A in just one month. The mentors
                were patient, knowledgeable, and genuinely invested in her progress.”
              </p>
              <p className="mt-4 text-gray-600 text-[17px] sm:text-[18px]">— Parent in New Jersey</p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
