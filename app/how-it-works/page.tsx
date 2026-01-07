export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* INTRO */}
      <section className="text-center mt-20 mb-20 px-6">
        <h1 className="text-4xl font-bold text-[#001F3F]">
          How It Works
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          A simple, personalized process designed for students and parents.
        </p>
      </section>

      {/* STEPS */}
      <section className="max-w-4xl mx-auto px-6 space-y-20 pb-24">

        {/* STEP 1 */}
        <div className="flex items-start gap-8">
          {/* Number */}
          <div className="text-5xl font-bold text-[#E63946] leading-none">
            01
          </div>

          {/* Divider + Content */}
          <div className="flex-1">
            <div className="h-px bg-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-[#001F3F]">
              Tell Us What You Need
            </h2>
            <p className="mt-3 text-lg text-gray-700">
              Parent or student fills the “Get Matched” form with subject,
              grade level, goals, and availability.
            </p>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="flex items-start gap-8">
          <div className="text-5xl font-bold text-[#E63946] leading-none">
            02
          </div>

          <div className="flex-1">
            <div className="h-px bg-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-[#001F3F]">
              We Match You With an Ivy Tutor
            </h2>
            <p className="mt-3 text-lg text-gray-700">
              We select the best tutor based on academic expertise,
              teaching style, and personality fit.
            </p>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="flex items-start gap-8">
          <div className="text-5xl font-bold text-[#E63946] leading-none">
            03
          </div>

          <div className="flex-1">
            <div className="h-px bg-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-[#001F3F]">
              Begin Your 1:1 Lessons
            </h2>
            <p className="mt-3 text-lg text-gray-700">
              Start personalized one-on-one sessions with flexible scheduling.
              No commitments — pay per session.
            </p>
          </div>
        </div>

      </section>

      {/* CLOSING LINE */}
      <section className="text-center pb-32 px-6">
        <p className="text-lg text-gray-600 italic">
          From first message to first lesson — we keep it simple.
        </p>
      </section>

    </main>
  );
}
