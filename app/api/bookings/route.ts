import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createBooking, listBookings } from "@/lib/scheduling";
import { bookingSchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse({ bookings: await listBookings(user) });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser(request, ["student"]);
  const booking = await createBooking(user, await parseJson(request, bookingSchema));
  return dataResponse({ booking }, 201);
});
