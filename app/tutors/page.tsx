import TutorCard from "@/components/TutorCard";

export default function TutorsPage() {
  const ACCENT = "#8B1E3F"; // muted Penn-style crimson

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
    <main className="min-h-screen bg-white text-[#001F3F]">
      {/* ===================== */}
      {/* TUTORS SECTION */}
      {/* ===================== */}

      <header className="pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
            Directory
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold">
            Our Tutors
          </h1>

          <div
            className="mt-5 h-px w-20"
            style={{ backgroundColor: ACCENT, opacity: 0.35 }}
          />

          <p className="mt-5 max-w-2xl text-lg text-gray-700 leading-relaxed">
            Meet our current student tutors. Each tutor is selected for academic
            strength, clarity, and a student-centered approach.
          </p>
        </div>
      </header>

      {/* SEARCH / FILTER — intentionally disabled for now */}
      {/*
      <section className="pb-10">
        <div className="max-w-6xl mx-auto px-6">
          ...
        </div>
      </section>
      */}

      {/* Tutor Grid */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {tutors.map((tutor) => (
              <TutorCard
                key={`${tutor.name}-${tutor.school}`}
                tutor={tutor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* PRICING SECTION (APPENDED) */}
      {/* ===================== */}

      <section className="border-t border-gray-200 pt-20 pb-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Pricing Header */}
          <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
            Program Information
          </p>

          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold">
            Our Tutoring Services &amp; Pricing
          </h2>

          <div
            className="mt-5 h-px w-20"
            style={{ backgroundColor: ACCENT, opacity: 0.35 }}
          />

          <p className="mt-5 max-w-2xl text-lg text-gray-700 leading-relaxed">
            Clear, transparent tutoring rates based on academic level and specialization.
          </p>

          {/* Pricing Cards */}
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {/* Card 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                Tutoring
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Standard Tutoring
              </h3>

              <div
                className="mt-4 h-px w-16"
                style={{ backgroundColor: ACCENT, opacity: 0.35 }}
              />

              <p className="mt-4 text-gray-700">
                Ideal for elementary, middle school, and standard high school subjects.
              </p>

              <div className="mt-6 text-3xl font-semibold">
                Starting at $55
                <span className="text-lg font-medium text-gray-600"> / hr</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                Advanced
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Advanced Tutoring
              </h3>

              <div
                className="mt-4 h-px w-16"
                style={{ backgroundColor: ACCENT, opacity: 0.35 }}
              />

              <p className="mt-4 text-gray-700">
                For advanced high school, AP/IB, and college-level coursework, including exam preparation.
              </p>

              <div className="mt-6 text-3xl font-semibold">
                Starting at $75
                <span className="text-lg font-medium text-gray-600"> / hr</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                Mentorship
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                College Admissions Mentorship
              </h3>

              <div
                className="mt-4 h-px w-16"
                style={{ backgroundColor: ACCENT, opacity: 0.35 }}
              />

              <p className="mt-4 text-gray-700">
                Comprehensive support for essays, application strategy, and personalized guidance
                through the admissions process.
              </p>

              <div className="mt-6 text-3xl font-semibold">
                Starting at $85
                <span className="text-lg font-medium text-gray-600"> / hr</span>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-12 max-w-2xl text-sm text-gray-500 leading-relaxed">
            Rates may vary slightly depending on subject specialization and tutor
            availability. Families are always informed prior to scheduling.
          </p>
        </div>
      </section>
    </main>
  );
}
