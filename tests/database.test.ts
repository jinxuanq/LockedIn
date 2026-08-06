import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../supabase/migrations/20260806042000_initial_platform.sql", import.meta.url),
  "utf8",
);

const tables = [
  "profiles",
  "student_profiles",
  "tutor_profiles",
  "subjects",
  "tutor_subjects",
  "inquiries",
  "conversations",
  "conversation_members",
  "messages",
  "availability_slots",
  "bookings",
  "curriculum_goals",
  "progress_entries",
  "notifications",
];

test("the initial migration creates every platform table with RLS", () => {
  for (const table of tables) {
    assert.match(migration, new RegExp(`create table public\\.${table} \\(`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
  }
});

test("the subject catalog is reference data, not sample user data", () => {
  assert.match(migration, /insert into public\.subjects/);
  assert.doesNotMatch(migration, /insert into auth\.users/i);
  assert.doesNotMatch(migration, /@lockedin\.local/i);
});

test("scheduling and inquiry indexes enforce production invariants", () => {
  assert.match(migration, /create index inquiries_routing_idx/);
  assert.match(migration, /create index messages_conversation_created_idx/);
  assert.equal((migration.match(/exclude using gist/g) ?? []).length, 3);
  assert.match(migration, /when exclusion_violation then/);
});

test("multi-table writes use database functions", () => {
  for (const operation of [
    "create_inquiry",
    "send_message",
    "create_booking",
    "update_booking_status",
    "create_curriculum_goal",
    "add_progress_entry",
  ]) {
    assert.match(migration, new RegExp(`function public\\.${operation}\\(`));
    assert.match(migration, new RegExp(`grant execute on function public\\.${operation}\\(`));
  }
});
