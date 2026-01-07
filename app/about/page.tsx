export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* INTRO */}
      <section className="text-center mt-20 mb-20 px-6">
        <h1 className="text-4xl font-bold text-[#001F3F]">
          About Us
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          We are a group of Ivy League students committed to providing thoughtful,
          high-quality academic support for motivated learners.
        </p>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-3xl mx-auto px-6 space-y-14 pb-24">

        {/* Who we are */}
        <div>
          <h2 className="text-2xl font-semibold text-[#001F3F]">
            Who We Are
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            We are current students from Ivy League universities who understand both
            the academic rigor students face and the importance of clear, patient instruction.
            Our goal is to make high-level academic guidance accessible, effective, and personal.
          </p>
        </div>

        {/* What we do */}
        <div>
          <h2 className="text-2xl font-semibold text-[#001F3F]">
            What We Do
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            We provide one-on-one tutoring for middle school and high school students across
            a wide range of subjects. This site serves as an initial introduction to our
            tutoring model and the values that guide our work.
          </p>
        </div>

        {/* Approach */}
        <div>
          <h2 className="text-2xl font-semibold text-[#001F3F]">
            Our Approach
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Every student learns differently. We focus on understanding each student’s needs,
            strengthening foundational skills, and building confidence through consistent,
            structured support.
          </p>
        </div>

      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#f8fafc] py-24">
        <div className="max-w-4xl mx-auto px-6">

          <h2 className="text-3xl font-semibold text-[#001F3F] text-center mb-16">
            What Families Are Saying
          </h2>

          <div className="max-w-2xl mx-auto">

            <blockquote className="border-l-4 border-[#E63946] pl-6 italic text-lg text-gray-700">
              “Our daughter raised her math grade from a B to an A in just one month.
              The Ivy League mentors were patient, knowledgeable, and genuinely invested
              in her success.”
              <footer className="mt-4 text-base font-medium text-gray-600 not-italic">
                — Parent in New Jersey
              </footer>
            </blockquote>

          </div>

        </div>
      </section>

    </main>
  );
}