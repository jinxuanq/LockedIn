export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* INTRO */}
      <section className="text-center mt-20 mb-20 px-6">
        <h1 className="text-4xl font-bold text-[#001F3F]">
          Pricing
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Clear, transparent tutoring rates based on academic level and specialization.
        </p>
      </section>

      {/* PRICING CARDS */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Card 1 */}
          <div className="border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#001F3F]">
              Standard Tutoring
            </h2>
            <p className="mt-2 text-gray-600">
              Based on subject difficulty and grade level.
            </p>

            <div className="mt-6 text-3xl font-bold text-[#001F3F]">
              $50–60<span className="text-lg font-medium text-gray-600"> / hr</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#001F3F]">
              Advanced Tutoring
            </h2>
            <p className="mt-2 text-gray-600">
              Advanced high school, AP/IB, and college-level coursework.
            </p>

            <div className="mt-6 text-3xl font-bold text-[#001F3F]">
              $70–80<span className="text-lg font-medium text-gray-600"> / hr</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#001F3F]">
              College Admissions Mentorship
            </h2>
            <p className="mt-2 text-gray-600">
              Essay workshops, application strategy, and long-term mentorship.
            </p>

            <div className="mt-6 text-3xl font-bold text-[#001F3F]">
              $80+<span className="text-lg font-medium text-gray-600"> / hr</span>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}