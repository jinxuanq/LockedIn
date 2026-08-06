"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase browser configuration is missing.");
  browserClient ??= createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}
