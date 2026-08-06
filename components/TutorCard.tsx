import Image from "next/image";
import Link from "next/link";
import type { TutorSummary } from "@/lib/types";

export default function TutorCard({ tutor }: { tutor: TutorSummary }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <Image src={tutor.image} alt={tutor.name} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F]/25 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B1E3F]">Approved tutor</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#001F3F]">{tutor.name} <span className="text-sm font-normal text-gray-500">({tutor.pronouns})</span></h2>
            <p className="mt-1 text-sm text-gray-600">{tutor.school}</p>
          </div>
          <span className="whitespace-nowrap text-sm font-semibold text-[#001F3F]">${tutor.hourlyRate}/hr</span>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#001F3F]">{tutor.headline}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{tutor.bio}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tutor.subjects.map((subject) => (
            <span key={subject.id} className="rounded-full border border-[#8B1E3F]/15 bg-[#8B1E3F]/5 px-3 py-1 text-xs font-semibold text-[#001F3F]">{subject.name}</span>
          ))}
        </div>
        <Link href={`/tutors/${tutor.id}`} className="mt-6 inline-flex items-center font-semibold text-[#8B1E3F]">View profile & availability →</Link>
      </div>
    </article>
  );
}
