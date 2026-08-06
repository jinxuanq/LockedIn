import { apiHandler, dataResponse } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";

export const GET = apiHandler(async (request) => {
  return dataResponse({ user: await getRequestUser(request) });
});
