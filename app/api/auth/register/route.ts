import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { registerUser } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export const POST = apiHandler(async (request) => {
  const input = await parseJson(request, registerSchema);
  return dataResponse(await registerUser(input), 201);
});
