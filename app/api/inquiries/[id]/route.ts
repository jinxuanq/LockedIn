import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateInquiry } from "@/lib/inquiries";
import { inquiryUpdateSchema } from "@/lib/validation";

export const PATCH = apiHandler(async (request, context) => {
  const user = await requireUser(request, ["admin"]);
  const { id } = await context.params;
  return dataResponse({
    inquiry: await updateInquiry(user, id, await parseJson(request, inquiryUpdateSchema)),
  });
});
