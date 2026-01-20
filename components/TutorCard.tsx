import Image from "next/image";

interface Tutor {
  name: string;
  pronouns: string;
  school: string;
  subjects: string;
  bio: string;
  image: string;
}

export default function TutorCard({ tutor }: { tutor: Tutor }) {
  const ACCENT = "#8B1E3F"; // muted Penn-style crimson

  // subjects string -> chips (supports comma-separated or bullet-like input)
  const subjectChips = tutor.subjects
    .split(/,|•|\|/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article
      className="
        group relative overflow-hidden rounded-xl bg-white
        border border-gray-200
        shadow-sm hover:shadow-md transition
        focus-within:shadow-md
      "
      tabIndex={0}
      aria-label={`Tutor card for ${tutor.name}`}
    >
      {/* Image */}
      <div className="relative h-56 w-full">
        <Image
          src={tutor.image}
          alt={tutor.name}
          fill
          className="object-cover"
        />
        {/* subtle navy tint for consistency (very light) */}
        <div className="absolute inset-0 bg-[#001F3F]/10" />
      </div>

      {/* Summary content */}
      <div className="p-6">
        {/* Eyebrow label */}
        <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
          Tutor
        </p>

        <div className="mt-2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#001F3F] leading-snug">
            {tutor.name}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({tutor.pronouns})
            </span>
          </h2>

          <p className="mt-1 text-sm text-gray-600">{tutor.school}</p>

          {/* Accent rule */}
          <div
            className="mt-4 h-px w-16"
            style={{ backgroundColor: ACCENT, opacity: 0.35 }}
            aria-hidden="true"
          />

          {/* Subjects as chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {subjectChips.slice(0, 6).map((s) => (
              <span
                key={s}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-[#001F3F]"
                style={{ backgroundColor: "rgba(139,30,63,0.04)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reveal panel: slides up on hover/focus (no dark overlay) */}
      <div
        className="
          absolute inset-x-0 bottom-0
          translate-y-full
          group-hover:translate-y-0 group-focus-within:translate-y-0
          transition-transform duration-300
          bg-white
          border-t border-gray-200
          p-6
        "
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
            About
          </p>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: ACCENT }}
            aria-hidden="true"
          />
        </div>

        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          {tutor.bio}
        </p>

        <p className="mt-4 text-xs text-gray-500">
          Tip: Hover or focus to read more.
        </p>
      </div>
    </article>
  );
}
