import { ApiError, apiHandler, dataResponse } from "@/lib/api";
import { getTutor, getTutorAvailability } from "@/lib/tutors";

export const GET = apiHandler(async (_request, context) => {
  const { id } = await context.params;
  const tutor = await getTutor(id);
  if (!tutor) throw new ApiError(404, "Tutor not found.");
  return dataResponse({ tutor, availability: await getTutorAvailability(id) });
});
