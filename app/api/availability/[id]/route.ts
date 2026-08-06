import { apiHandler, dataResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { removeAvailability } from "@/lib/scheduling";

export const DELETE = apiHandler(async (request, context) => {
  const user = await requireUser(request, ["tutor"]);
  const { id } = await context.params;
  await removeAvailability(user, id);
  return dataResponse({ success: true });
});
