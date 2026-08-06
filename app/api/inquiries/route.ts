import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createInquiry, listInquiries } from "@/lib/inquiries";
import { inquirySchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse({ inquiries: await listInquiries(user) });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser(request, ["student"]);
  const inquiry = await createInquiry(user, await parseJson(request, inquirySchema));
  return dataResponse({ inquiry }, 201);
});
