import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { addAvailability, listTutorSlots } from "@/lib/scheduling";
import { availabilitySchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request, ["tutor"]);
  return dataResponse({ availability: await listTutorSlots(user) });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser(request, ["tutor"]);
  return dataResponse(
    { availability: await addAvailability(user, await parseJson(request, availabilitySchema)) },
    201,
  );
});
