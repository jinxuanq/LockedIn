"use client";

import TutorCard from "@/components/TutorCard";
import { useEffect, useRef, useState } from "react";

/**
 * Reveal: subtle fade-up on scroll (guaranteed visible)
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
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setReady(true);

    if (prefersReduced) {
      setShow(true);
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
        ready
          ? show
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
          : "opacity-0 translate-y-5",
        "transition-all duration-500 ease-out will-change-transform",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * UnderlineLink: micro-delight underline grows in from left on hover/focus
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
      style={
        {
          ...(props.style || {}),
          // @ts-ignore
          ["--u" as any]: underlineColor,
        } as React.CSSProperties
      }
    >
      {children}
    </a>
  );
}

export default function TutorsPage() {
  const ACCENT = "#8B1E3F"; // muted Penn-style crimson

  // Readability tuned for parents (without bloating typography)
  const bodyText = "text-[17px] sm:text-[18px] text-gray-700 leading-relaxed";
  const smallLabel = "text-xs font-semibold tracking-wide uppercase text-gray-500";

  // Pricing card styles (THIS fixes your crash: cardBase is now defined)
  const cardBase = "relative rounded-xl border border-gray-200 bg-white";
  const cardMotion =
    "transition-all duration-300 ease-out " +
    "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.04] " +
    "motion-reduce:transform-none motion-reduce:transition-none";
  const cardWarmTint = "hover:bg-[rgba(139,30,63,0.02)]";
  const cardAccentRail =
    "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-l-xl " +
    "before:bg-[rgba(139,30,63,0.0)] hover:before:bg-[rgba(139,30,63,0.35)] " +
    "before:transition-colors before:duration-300";

  // Tutor card wrapper motion:
  // TutorCard already has border/shadow + reveal panel.
  // We only add a *container lift/scale* so nothing conflicts visually.
  const tutorWrapper =
    "transition-all duration-300 ease-out " +
    "hover:-translate-y-1 hover:scale-[1.03] hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)] " +
    "motion-reduce:transform-none motion-reduce:transition-none";

  // Temporary static tutor data (replace with DB/API later)
  const tutors = [
    {
      name: "Adrianna",
      pronouns: "she/her",
      school: "Cornell 29’",
      subjects: "Public Policy, Economics",
      bio: `Hi, I’m Adrianna! I’m a first-year at Cornell University studying public policy and economics. 
      I am also an avid skier and sailor. I look forward to working together!`,
      image: "/images/adrianna.jpeg",
    },
    {
      name: "Aimee",
      pronouns: "she/her",
      school: "Princeton 29’",
      subjects: "Molecular Biology",
      bio: `Hi, I’m Aimee! I’m a first-year at Princeton studying Molecular Biology. 
      I spend most of my free time dancing (ballet is my favorite), and I also love reading and strolling around :) 
      Excited to learn together!`,
      image: "/images/aimee.jpeg",
    },
    {
      name: "Akhil",
      pronouns: "he/him",
      school: "Brown 29’",
      subjects: "Behavioral Decision Sciences",
      bio: `Hey! I'm Akhil, a first-year at Brown studying Behavioral Decision Sciences.
      Outside of academics, I do Model UN and I'm a black belt in Mixed Martial Arts.
      I always love to learn, grow, and work with others!`,
      image: "/images/akhil.jpeg",
    },
    {
      name: "Aran",
      pronouns: "he/him",
      school: "Brown 29’",
      subjects: "Politics Philosophy Economics, Music",
      bio: `Hi! My name is Aran, and I’m a first-year at Brown University. I enjoy singing and playing piano, 
      and I’m exploring a combination of academic and musical coursework at Brown. 
      I look forward to working with and getting to know you through this program!`,
      image: "/images/aran.jpeg",
    },
    {
      name: "Carnegie",
      pronouns: "he/him",
      school: "Cornell 28’",
      subjects: "Biology, Chemistry",
      bio: `Outside of my studies, I am an avid runner, rock climber, and soccer fan. 
      I also have a keen interest in complex systems, ranging from grand strategy gaming to the competitive esports scene.`,
      image: "/images/carnegie.jpeg",
    },
    {
      name: "Franklin",
      pronouns: "he/him",
      school: "Brown 29’",
      subjects: "Applied Mathematics, Computer Science",
      bio: `Hey, I’m Franklin!  love playing piano (classical!), reading, and cooking. 
      At Brown, I’m an event supervisor for Science Olympiad (I also competed during high school!), 
      I’m part of Full Stack, and I’m working on a startup side project.`,
      image: "/images/franklin.jpeg",
    },
    {
      name: "Freja",
      pronouns: "she/her",
      school: "Brown 29’",
      subjects: "Undecided",
      bio: `Hi, I’m Freja! I love reading, playing clarinet, and all sorts of outdoor activities such as camping and hiking! 
      Academically, I am exploring a broad range of interests. Looking forward to working together and finding what 
      learning style works best for you!`,
      image: "/images/freja.jpeg",
    },
    {
      name: "Jaimin",
      pronouns: "she/her",
      school: "Columbia 29’",
      subjects: "English, Cognitive Science",
      bio: `Hi! I’m Jaimin! I love any kind of crafting hobbies, such as crocheting and origami-making, 
      and I also have experience working at a summer camp with elementary students and babysitting my pre-schooler cousin. 
      I’m excited to work with you!`,
      image: "/images/jaimin.jpeg",
    },
    {
      name: "Myles",
      pronouns: "he/him",
      school: "Cornell 29’",
      subjects: "Biochemistry",
      bio: `Hi, I’m Myles! I’m currently on the pre-med track with a minor in Classics. 
      In my free time, I love doing photography, playing piano, and practicing tennis. 
      I really enjoy helping others while sharing my interests and passions!`,
      image: "/images/myles.jpeg",
    },
    {
      name: "Ryan",
      pronouns: "he/him",
      school: "Brown 29’",
      subjects: "Design Engineering, Business Economics",
      bio: `Hey, I’m Ryan! I love sports, particularly tennis, skiing, swimming, and running. 
      I’m also the co-founder and CPO of Bloom, where we’re creating tech-driven solutions for plant care. 
      Always excited to build, learn, and collaborate!`,
      image: "/images/ryan.jpeg",
    },
    {
      name: "Shinyi",
      pronouns: "she/her",
      school: "UChicago 28’",
      subjects: "Computer Science, Economics",
      bio: `Hi, I’m Shinyi! I’m a sophomore at UChicago studying CS and Econ. At school, I’m part of the Language 
      Processing Lab. In my free time, I like crocheting, cooking, and watching soccer.`,
      image: "/images/shinyi.jpeg",
    },
    {
      name: "Stephanie",
      pronouns: "she/her",
      school: "Cornell 29’",
      subjects: "Communication and Information Science",
      bio: `Hi, I’m Stephanie! I’m a first-year at Cornell studying Communication, 
      planning on double majoring in Info Science. In my free time, 
      I manage my own social media account and post videos that I edit!`,
      image: "/images/stephanie.jpeg",
    },
    {
      name: "Yufeng",
      pronouns: "he/him",
      school: "UMich 26’",
      subjects: "Computer Science, Data Analytics",
      bio: `I am YuFeng, senior at University of Michigan! I am the president of the school's Chinese Language Table 
      because I enjoy exchanging cultures with people from different backgrounds!`,
      image: "/images/yufeng.jpeg",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#001F3F] [font-size:18px] leading-[1.7]">
      {/* ===================== */}
      {/* TUTORS SECTION */}
      {/* ===================== */}

      {/* Anchored header block */}
      <header className="pt-14 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="px-6 sm:px-10 py-9">
                <p className={smallLabel}>Directory</p>

                <h1 className="mt-3 text-4xl sm:text-5xl font-semibold">
                  Our Tutors
                </h1>

                <div
                  className="mt-5 h-px w-20"
                  style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                />

                <p className={"mt-5 max-w-2xl " + bodyText}>
                  Meet our current student tutors. Each tutor is selected for academic strength,
                  clarity, and a student-centered approach.
                </p>

                <div className="mt-5">
                  <UnderlineLink
                    href="#pricing"
                    underlineColor={ACCENT}
                    className="text-[17px] sm:text-[18px] text-[#001F3F] rounded-md focus-visible:ring-[#8B1E3F]/25"
                  >
                    View tutoring services &amp; pricing →
                  </UnderlineLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* Tutor Grid */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className={smallLabel}>Selection</p>
                <p className={"mt-1 " + bodyText}>
                  Browse by fit — we’ll still match you based on goals and availability.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-[#001F3F]">{tutors.length}</span>{" "}
                tutors listed
                <span className="mx-2 text-gray-300">|</span>
                <span className="inline-block">
                  Ready to start?{" "}
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScBTd-fMie2BziRNCEUAjYahEt3zwujy0maNvyJ4XsheYSUbQ/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                    style={{ color: ACCENT }}
                  >
                    Request a match →
                  </a>
                </span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {tutors.map((tutor, idx) => (
              <Reveal key={`${tutor.name}-${tutor.school}`} delayMs={(idx % 9) * 60}>
                {/* Wrapper adds the “homepage-style” lift/scale without fighting TutorCard’s own styling */}
                <div className={tutorWrapper}>
                  <TutorCard tutor={tutor} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* PRICING SECTION */}
      {/* ===================== */}

      <section id="pricing" className="border-t border-gray-200 pt-20 pb-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className={smallLabel}>Program Information</p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold">
              Our Tutoring Services &amp; Pricing
            </h2>

            <div
              className="mt-5 h-px w-20"
              style={{ backgroundColor: ACCENT, opacity: 0.35 }}
            />

            <p className={"mt-5 max-w-2xl " + bodyText}>
              Clear, transparent tutoring rates based on academic level and specialization.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {[
              {
                label: "Tutoring",
                title: "Standard Tutoring",
                desc: "Ideal for elementary, middle school, and standard high school subjects.",
                price: "Starting at $55",
              },
              {
                label: "Advanced",
                title: "Advanced Tutoring",
                desc: "For advanced high school, AP/IB, and college-level coursework, including exam preparation.",
                price: "Starting at $75",
              },
              {
                label: "Mentorship",
                title: "College Admissions Mentorship",
                desc: "Comprehensive support for essays, application strategy, and personalized guidance through the admissions process.",
                price: "Starting at $85",
              },
            ].map((c, idx) => (
              <Reveal key={c.title} delayMs={idx * 90}>
                <div
                  className={[
                    cardBase,
                    cardMotion,
                    cardWarmTint,
                    cardAccentRail,
                    "p-8",
                  ].join(" ")}
                >
                  <p className={smallLabel}>{c.label}</p>

                  <h3 className="mt-2 text-xl sm:text-2xl font-semibold">
                    {c.title}
                  </h3>

                  <div
                    className="mt-4 h-px w-16"
                    style={{ backgroundColor: ACCENT, opacity: 0.35 }}
                  />

                  <p className={"mt-4 " + bodyText}>{c.desc}</p>

                  <div className="mt-6 text-3xl font-semibold">
                    {c.price}
                    <span className="text-lg font-medium text-gray-600"> / hr</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={120}>
            <p className="mt-12 max-w-2xl text-[15px] sm:text-[16px] text-gray-500 leading-relaxed">
              Rates may vary slightly depending on subject specialization and tutor availability.
              Families are always informed prior to scheduling.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
