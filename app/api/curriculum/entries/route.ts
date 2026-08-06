import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { addProgressEntry } from "@/lib/curriculum";
import { progressEntrySchema } from "@/lib/validation";

export const POST = apiHandler(async (request) => {
  const user = await requireUser(request, ["tutor"]);
  return dataResponse(
    { entry: await addProgressEntry(user, await parseJson(request, progressEntrySchema)) },
    201,
  );
});
