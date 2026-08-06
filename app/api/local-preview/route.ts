import { ApiError, apiHandler, dataResponse } from "@/lib/api";
import { getLocalPreviewAccounts } from "@/lib/local-preview";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const accounts = getLocalPreviewAccounts();
  if (!accounts) throw new ApiError(404, "Local preview mode is not enabled.");
  return dataResponse({ accounts });
});
