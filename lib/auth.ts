import "server-only";

import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { SafeUser, UserRole } from "@/lib/types";

interface ProfileRow {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

function mapUser(user: User, profile: ProfileRow): SafeUser {
  return {
    id: profile.id,
    email: user.email ?? "",
    name: profile.name,
    role: profile.role,
    createdAt: profile.created_at,
  };
}

async function profileForAuthUser(user: User): Promise<SafeUser> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .eq("id", user.id)
    .single();
  if (error || !data) throw new ApiError(500, "Account profile could not be loaded.");
  return mapUser(user, data as ProfileRow);
}

export async function signInWithPassword(email: string, password: string): Promise<SafeUser> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new ApiError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
  }
  return profileForAuthUser(data.user);
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  role: Exclude<UserRole, "admin">;
}): Promise<{ user: SafeUser; requiresEmailConfirmation: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name, role: input.role } },
  });
  if (error) {
    const duplicate = error.code === "user_already_exists" || error.message.includes("already registered");
    throw new ApiError(
      duplicate ? 409 : 422,
      duplicate ? "An account with that email already exists." : error.message,
      duplicate ? "EMAIL_EXISTS" : "AUTH_ERROR",
    );
  }
  if (!data.user || data.user.identities?.length === 0) {
    throw new ApiError(409, "An account with that email already exists.", "EMAIL_EXISTS");
  }

  const user: SafeUser = {
    id: data.user.id,
    email: data.user.email ?? input.email,
    name: input.name,
    role: input.role,
    createdAt: data.user.created_at,
  };
  return { user, requiresEmailConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new ApiError(500, "Could not sign out.");
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  if (!getSupabasePublicConfig()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (error || !userId || !claims) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .eq("id", userId)
    .single();
  if (profileError || !profile) return null;

  return {
    id: userId,
    email: typeof claims.email === "string" ? claims.email : "",
    name: profile.name as string,
    role: profile.role as UserRole,
    createdAt: profile.created_at as string,
  };
}

export async function getRequestUser(request?: NextRequest): Promise<SafeUser | null> {
  void request;
  return getCurrentUser();
}

export async function requireUser(
  request?: NextRequest,
  allowedRoles?: UserRole[],
): Promise<SafeUser> {
  const user = await getRequestUser(request);
  if (user === null) {
    throw new ApiError(401, "Please sign in to continue.", "AUTH_REQUIRED");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to do that.", "FORBIDDEN");
  }
  return user;
}
