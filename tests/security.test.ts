import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../supabase/migrations/20260806042000_initial_platform.sql", import.meta.url),
  "utf8",
);
const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

test("public clients receive limited grants", () => {
  assert.match(migration, /revoke all on all tables in schema public from anon, authenticated;/);
  assert.match(migration, /grant update \(last_read_at\) on public\.conversation_members/);
  assert.match(migration, /grant update \(read_at\) on public\.notifications/);
  assert.doesNotMatch(migration, /grant (insert|delete) on .* to (anon|authenticated)/i);
});

test("admin metadata cannot self-promote new accounts", () => {
  assert.match(migration, /when new\.raw_user_meta_data ->> 'role' = 'tutor'/);
  assert.doesNotMatch(migration, /raw_user_meta_data ->> 'role' = 'admin'/);
  assert.match(migration, /if not public\.is_admin\(\) then raise exception 'Admin account required\.'/);
});

test("repository configuration never requests a privileged Supabase key", () => {
  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(envExample, /SERVICE_ROLE|SECRET_KEY|DATABASE_PASSWORD/);
});
