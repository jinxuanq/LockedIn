import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createConversation, listConversations } from "@/lib/conversations";
import { conversationSchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse({ conversations: await listConversations(user) });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser(request, ["student", "tutor"]);
  const input = await parseJson(request, conversationSchema);
  return dataResponse({ conversation: await createConversation(user, input.userId) }, 201);
});
