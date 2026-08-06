import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateBooking } from "@/lib/scheduling";
import { bookingUpdateSchema } from "@/lib/validation";

export const PATCH = apiHandler(async (request, context) => {
  const user = await requireUser(request);
  const { id } = await context.params;
  const input = await parseJson(request, bookingUpdateSchema);
  return dataResponse({ booking: await updateBooking(user, id, input.status) });
});
