import { apiHandler, dataResponse } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getNotifications, markNotificationsRead } from "@/lib/dashboard";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse({ notifications: await getNotifications(user) });
});

export const PATCH = apiHandler(async (request) => {
  const user = await requireUser(request);
  await markNotificationsRead(user);
  return dataResponse({ success: true });
});
