import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getMessages, sendMessage } from "@/lib/conversations";
import { messageSchema } from "@/lib/validation";

export const GET = apiHandler(async (request, context) => {
  const user = await requireUser(request);
  const { id } = await context.params;
  return dataResponse({ messages: await getMessages(user, id) });
});

export const POST = apiHandler(async (request, context) => {
  const user = await requireUser(request);
  const { id } = await context.params;
  const input = await parseJson(request, messageSchema);
  return dataResponse({ message: await sendMessage(user, id, input.body) }, 201);
});
