import { apiHandler, dataResponse } from "@/lib/api";
import { listTutors } from "@/lib/tutors";
import { tutorSearchSchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const input = tutorSearchSchema.parse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    subject: request.nextUrl.searchParams.get("subject") ?? "",
    maxRate: request.nextUrl.searchParams.get("maxRate") || undefined,
  });
  return dataResponse({ tutors: await listTutors(input) });
});
