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
  return (
    <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer bg-white">
      <div className="relative w-full h-64">
        <Image
          src={tutor.image}
          alt={tutor.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-[#001F3F]">
          {tutor.name}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({tutor.pronouns})
          </span>
        </h2>

        <p className="text-gray-600">{tutor.school}</p>
        <p className="text-gray-700 mt-1">{tutor.subjects}</p>
      </div>

      <div className="
        absolute inset-0 
        bg-black/70 
        text-white 
        p-6 
        opacity-0 
        group-hover:opacity-100 
        transition-opacity 
        flex 
        items-center 
        justify-center 
        text-center
      ">
        <p className="text-lg leading-relaxed">{tutor.bio}</p>
      </div>
    </div>
  );
}