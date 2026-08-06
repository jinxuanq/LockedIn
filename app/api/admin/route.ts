import { z } from "zod";
import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getAdminOverview, setTutorApproval } from "@/lib/dashboard";

const adminUpdateSchema = z.object({
  tutorId: z.string().min(1).max(100),
  approved: z.boolean(),
});

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request, ["admin"]);
  return dataResponse(await getAdminOverview(user));
});

export const PATCH = apiHandler(async (request) => {
  const user = await requireUser(request, ["admin"]);
  const input = await parseJson(request, adminUpdateSchema);
  await setTutorApproval(user, input.tutorId, input.approved);
  return dataResponse(await getAdminOverview(user));
});
