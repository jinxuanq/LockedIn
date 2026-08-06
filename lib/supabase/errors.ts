import type { PostgrestError } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api";

export function throwIfSupabaseError(error: PostgrestError | null): void {
  if (!error) return;
  if (error.code === "P0001") throw new ApiError(422, error.message, "DATABASE_RULE");
  if (error.code === "23505" || error.code === "23P01") {
    throw new ApiError(409, "That change conflicts with existing data.", "DATA_CONFLICT");
  }
  if (error.code === "42501") {
    throw new ApiError(403, "You do not have permission to do that.", "FORBIDDEN");
  }
  if (error.code === "PGRST116") throw new ApiError(404, "Record not found.", "NOT_FOUND");
  throw new ApiError(500, "The database request could not be completed.", "DATABASE_ERROR");
}
