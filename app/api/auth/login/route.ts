import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { signInWithPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export const POST = apiHandler(async (request) => {
  const input = await parseJson(request, loginSchema);
  return dataResponse({ user: await signInWithPassword(input.email, input.password) });
});
