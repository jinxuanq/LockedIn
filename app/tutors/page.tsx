import Image from "next/image";
import TutorCard from "@/components/TutorCard";

export default function TutorsPage() {
  // Temporary static tutor data (replace with DB/API later)
  const tutors = [
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
      name: "Franklin",
      pronouns: "he/him",
      school: "Brown 29’",
      subjects: "Applied Mathematics-Computer Science",
      bio: `Hey, I’m Franklin!  love playing piano (classical!), reading, and cooking. 
      At Brown, I’m an event supervisor for Science Olympiad (I also competed during high school!), 
      I’m part of Full Stack, and I’m working on a startup side project.`,
      image: "/images/franklin.jpeg",
    },
    {
      name: "Jaimin",
      pronouns: "she/her",
      school: "Columbia 29’",
      subjects: "English or Cognitive Science",
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
      subjects: "Design Engineering & Business Economics",
      bio: `Hey, I’m Ryan! I love sports, particularly tennis, skiing, swimming, and running. 
      I’m also the co-founder and CPO of Bloom, where we’re creating tech-driven solutions for plant care. 
      Always excited to build, learn, and collaborate!`,
      image: "/images/ryan.jpeg",
    },
    {
      name: "Yufeng",
      pronouns: "he/him",
      school: "UMich 26’",
      subjects: " Computer Science & Data Analytics",
      bio: `I am YuFeng, senior at University of Michigan! I am the president of the school's Chinese Language Table 
      because I enjoy exchanging cultures with people from different backgrounds!`,
      image: "/images/yufeng.jpeg",
    },
  ];

  return (
    <main className="min-h-screen bg-white">

      {/* INTRO SECTION */}
      <section className="text-center mt-16 mb-10 px-6">
        <h1 className="text-4xl font-bold text-[#001F3F]">Our Tutors</h1>
        <p className="mt-4 text-lg text-gray-600">
          Meet our Ivy League student tutors.
        </p>
      </section>

      {/* FUTURE SEARCH + FILTER SECTION (STRUCTURE ONLY — HIDDEN VISUALLY) */}
      <section id="future-controls" className="hidden">
        <div className="max-w-4xl mx-auto flex gap-4 px-6 py-4">
          <input
            type="text"
            placeholder="Search tutors..."
            className="border px-4 py-2 rounded w-full"
          />
          <select className="border px-3 py-2 rounded">
            <option>All Subjects</option>
          </select>
        </div>
      </section>

      {/* TUTOR GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {tutors.map((tutor, idx) => (
            <TutorCard key={idx} tutor={tutor} />
          ))}
        </div>
      </section>

      {/* FUTURE PAGINATION / EXTRA SECTIONS (HIDDEN FOR NOW) */}
      <section id="future-pagination" className="hidden"></section>

    </main>
  );
}