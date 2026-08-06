import { apiHandler, dataResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse(await getDashboard(user));
});
