import { apiHandler, dataResponse } from "@/lib/api";
import { signOut } from "@/lib/auth";

export const POST = apiHandler(async () => {
  await signOut();
  return dataResponse({ success: true });
});
