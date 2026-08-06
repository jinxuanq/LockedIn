create extension if not exists btree_gist with schema extensions;

create type public.user_role as enum ('student', 'tutor', 'admin');
create type public.inquiry_status as enum ('new', 'matched', 'closed');
create type public.slot_status as enum ('open', 'held', 'booked');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type public.goal_status as enum ('active', 'completed', 'paused');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  role public.user_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  grade_level text not null default '',
  guardian_name text not null default '',
  goals text not null default '',
  timezone text not null default 'America/New_York',
  updated_at timestamptz not null default now()
);

create table public.tutor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  pronouns text not null default '',
  school text not null default '',
  headline text not null default '',
  bio text not null default '',
  image_url text not null default '/images/hero-tutors.jpg',
  hourly_rate integer not null default 5500 check (hourly_rate >= 0),
  timezone text not null default 'America/New_York',
  approved boolean not null default false,
  updated_at timestamptz not null default now()
);
create index tutor_profiles_approved_rate_idx
  on public.tutor_profiles (approved, hourly_rate);

create table public.subjects (
  id text primary key,
  slug text not null unique,
  name text not null unique,
  category text not null
);
create index subjects_category_name_idx on public.subjects (category, name);

create table public.tutor_subjects (
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  subject_id text not null references public.subjects(id) on delete cascade,
  level text not null default 'Middle & High School',
  primary key (tutor_id, subject_id)
);
create index tutor_subjects_subject_tutor_idx
  on public.tutor_subjects (subject_id, tutor_id);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  requested_tutor_id uuid references public.profiles(id) on delete set null,
  assigned_tutor_id uuid references public.profiles(id) on delete set null,
  subject_id text not null references public.subjects(id),
  goals text not null check (char_length(goals) between 20 and 2000),
  availability_notes text not null default '',
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_student_created_idx
  on public.inquiries (student_id, created_at desc);
create index inquiries_routing_idx
  on public.inquiries (status, subject_id, created_at);
create index inquiries_requested_tutor_idx
  on public.inquiries (requested_tutor_id, status);
create index inquiries_assigned_tutor_idx
  on public.inquiries (assigned_tutor_id, status);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid unique references public.inquiries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);
create index conversation_members_user_idx
  on public.conversation_members (user_id, conversation_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at, id);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.slot_status not null default 'open',
  created_at timestamptz not null default now(),
  check (start_time < end_time),
  exclude using gist (
    tutor_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  )
);
create index availability_lookup_idx
  on public.availability_slots (tutor_id, status, start_time);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  subject_id text not null references public.subjects(id),
  availability_slot_id uuid references public.availability_slots(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.booking_status not null default 'requested',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time),
  exclude using gist (
    tutor_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  ) where (status in ('requested', 'confirmed')),
  exclude using gist (
    student_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  ) where (status in ('requested', 'confirmed'))
);
create index bookings_student_start_idx
  on public.bookings (student_id, start_time desc);
create index bookings_tutor_start_idx
  on public.bookings (tutor_id, start_time desc);

create table public.curriculum_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  subject_id text not null references public.subjects(id),
  title text not null check (char_length(title) between 3 and 160),
  description text not null default '',
  status public.goal_status not null default 'active',
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index curriculum_student_status_idx
  on public.curriculum_goals (student_id, status, updated_at desc);
create index curriculum_tutor_student_idx
  on public.curriculum_goals (tutor_id, student_id, updated_at desc);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.curriculum_goals(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  summary text not null check (char_length(summary) between 10 and 2000),
  next_steps text not null default '',
  mastery integer not null check (mastery between 1 and 5),
  created_at timestamptz not null default now()
);
create index progress_goal_created_idx
  on public.progress_entries (goal_id, created_at desc);
create index progress_student_created_idx
  on public.progress_entries (student_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx
  on public.notifications (user_id, read_at, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger student_profiles_set_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();
create trigger tutor_profiles_set_updated_at
before update on public.tutor_profiles
for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();
create trigger curriculum_goals_set_updated_at
before update on public.curriculum_goals
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role public.user_role;
  display_name text;
begin
  selected_role := case
    when new.raw_user_meta_data ->> 'role' = 'tutor' then 'tutor'::public.user_role
    else 'student'::public.user_role
  end;
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'LockedIn user'), '@', 1)
  );

  insert into public.profiles (id, name, role)
  values (new.id, display_name, selected_role);

  if selected_role = 'tutor' then
    insert into public.tutor_profiles (user_id) values (new.id);
  else
    insert into public.student_profiles (user_id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = target_conversation_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_tutoring_relationship(first_user_id uuid, second_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.bookings
    where status <> 'cancelled'
      and ((student_id = first_user_id and tutor_id = second_user_id)
        or (student_id = second_user_id and tutor_id = first_user_id))
    union all
    select 1 from public.inquiries
    where status <> 'closed'
      and ((student_id = first_user_id and assigned_tutor_id = second_user_id)
        or (student_id = second_user_id and assigned_tutor_id = first_user_id))
    union all
    select 1
    from public.conversation_members first_member
    join public.conversation_members second_member
      on second_member.conversation_id = first_member.conversation_id
    where first_member.user_id = first_user_id
      and second_member.user_id = second_user_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.inquiries enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.curriculum_goals enable row level security;
alter table public.progress_entries enable row level security;
alter table public.notifications enable row level security;

create policy "Approved tutor names are public"
on public.profiles for select
to anon, authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
  or (
    role = 'tutor'
    and exists (
      select 1 from public.tutor_profiles
      where tutor_profiles.user_id = profiles.id and tutor_profiles.approved
    )
  )
  or public.has_tutoring_relationship((select auth.uid()), id)
);

create policy "Users update their own display name"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Student profiles follow tutoring relationships"
on public.student_profiles for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
  or public.has_tutoring_relationship((select auth.uid()), user_id)
);

create policy "Approved tutor profiles are public"
on public.tutor_profiles for select
to anon, authenticated
using (approved or user_id = (select auth.uid()) or public.is_admin());

create policy "Subjects are public"
on public.subjects for select
to anon, authenticated
using (true);

create policy "Approved tutor subjects are public"
on public.tutor_subjects for select
to anon, authenticated
using (
  tutor_id = (select auth.uid())
  or public.is_admin()
  or exists (
    select 1 from public.tutor_profiles
    where tutor_profiles.user_id = tutor_subjects.tutor_id and tutor_profiles.approved
  )
);

create policy "Inquiry participants can read"
on public.inquiries for select
to authenticated
using (
  public.is_admin()
  or student_id = (select auth.uid())
  or requested_tutor_id = (select auth.uid())
  or assigned_tutor_id = (select auth.uid())
);

create policy "Conversation members can read conversations"
on public.conversations for select
to authenticated
using (public.is_admin() or public.is_conversation_member(id));

create policy "Conversation members can read membership"
on public.conversation_members for select
to authenticated
using (public.is_admin() or public.is_conversation_member(conversation_id));

create policy "Members update their own read marker"
on public.conversation_members for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Conversation members can read messages"
on public.messages for select
to authenticated
using (public.is_admin() or public.is_conversation_member(conversation_id));

create policy "Open availability is public"
on public.availability_slots for select
to anon, authenticated
using (
  (status = 'open' and start_time > now())
  or tutor_id = (select auth.uid())
  or public.is_admin()
);

create policy "Booking participants can read"
on public.bookings for select
to authenticated
using (
  public.is_admin()
  or student_id = (select auth.uid())
  or tutor_id = (select auth.uid())
);

create policy "Curriculum participants can read goals"
on public.curriculum_goals for select
to authenticated
using (
  public.is_admin()
  or student_id = (select auth.uid())
  or tutor_id = (select auth.uid())
);

create policy "Curriculum participants can read progress"
on public.progress_entries for select
to authenticated
using (
  public.is_admin()
  or student_id = (select auth.uid())
  or tutor_id = (select auth.uid())
);

create policy "Users read their own notifications"
on public.notifications for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy "Users mark their own notifications read"
on public.notifications for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.tutor_profiles, public.subjects,
  public.tutor_subjects, public.availability_slots to anon, authenticated;
grant select on public.student_profiles, public.inquiries, public.conversations,
  public.conversation_members, public.messages, public.bookings,
  public.curriculum_goals, public.progress_entries, public.notifications to authenticated;
grant update (last_read_at) on public.conversation_members to authenticated;
grant update (read_at) on public.notifications to authenticated;

create or replace function public.update_student_profile(
  display_name text,
  new_grade_level text,
  new_guardian_name text,
  new_goals text,
  new_timezone text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'student' then
    raise exception 'Student account required.';
  end if;
  update public.profiles set name = display_name where id = (select auth.uid());
  update public.student_profiles set
    grade_level = new_grade_level,
    guardian_name = new_guardian_name,
    goals = new_goals,
    timezone = new_timezone
  where user_id = (select auth.uid());
end;
$$;

create or replace function public.update_tutor_profile(
  display_name text,
  new_pronouns text,
  new_school text,
  new_headline text,
  new_bio text,
  new_image_url text,
  new_hourly_rate integer,
  new_timezone text,
  new_subject_ids text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'tutor' then
    raise exception 'Tutor account required.';
  end if;
  if new_hourly_rate < 0 then raise exception 'Hourly rate cannot be negative.'; end if;
  if (select count(*) from public.subjects where id = any(new_subject_ids))
      <> cardinality(new_subject_ids) then
    raise exception 'One or more subjects are invalid.';
  end if;

  update public.profiles set name = display_name where id = (select auth.uid());
  update public.tutor_profiles set
    pronouns = new_pronouns,
    school = new_school,
    headline = new_headline,
    bio = new_bio,
    image_url = new_image_url,
    hourly_rate = new_hourly_rate,
    timezone = new_timezone
  where user_id = (select auth.uid());
  delete from public.tutor_subjects where tutor_id = (select auth.uid());
  insert into public.tutor_subjects (tutor_id, subject_id)
  select (select auth.uid()), subject_id from unnest(new_subject_ids) as subject_id;
end;
$$;

create or replace function public.create_inquiry(
  selected_tutor_id uuid,
  selected_subject_id text,
  inquiry_goals text,
  inquiry_availability_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  routed_tutor_id uuid;
  new_inquiry_id uuid;
  new_conversation_id uuid;
  subject_name text;
  student_name text;
begin
  if public.current_user_role() <> 'student' then
    raise exception 'Student account required.';
  end if;
  select name into subject_name from public.subjects where id = selected_subject_id;
  if subject_name is null then raise exception 'Please select a valid subject.'; end if;

  if selected_tutor_id is not null then
    select tp.user_id into routed_tutor_id
    from public.tutor_profiles tp
    join public.tutor_subjects ts on ts.tutor_id = tp.user_id
    where tp.user_id = selected_tutor_id
      and tp.approved and ts.subject_id = selected_subject_id;
    if routed_tutor_id is null then
      raise exception 'That tutor is not currently available for the selected subject.';
    end if;
  else
    select tp.user_id into routed_tutor_id
    from public.tutor_profiles tp
    join public.profiles profile on profile.id = tp.user_id
    join public.tutor_subjects ts
      on ts.tutor_id = tp.user_id and ts.subject_id = selected_subject_id
    left join public.inquiries active
      on active.assigned_tutor_id = tp.user_id and active.status in ('new', 'matched')
    where tp.approved
    group by tp.user_id, profile.name
    order by count(active.id), profile.name
    limit 1;
    if routed_tutor_id is null then
      raise exception 'No approved tutor currently covers that subject.';
    end if;
  end if;

  insert into public.inquiries (
    student_id, requested_tutor_id, assigned_tutor_id, subject_id,
    goals, availability_notes, status
  ) values (
    (select auth.uid()), selected_tutor_id, routed_tutor_id, selected_subject_id,
    inquiry_goals, inquiry_availability_notes, 'matched'
  ) returning id into new_inquiry_id;

  insert into public.conversations (inquiry_id)
  values (new_inquiry_id) returning id into new_conversation_id;
  insert into public.conversation_members (conversation_id, user_id, last_read_at)
  values
    (new_conversation_id, (select auth.uid()), now()),
    (new_conversation_id, routed_tutor_id, null);
  insert into public.messages (conversation_id, sender_id, body)
  values (new_conversation_id, (select auth.uid()), inquiry_goals);

  select name into student_name from public.profiles where id = (select auth.uid());
  insert into public.notifications (user_id, type, title, body)
  values (
    routed_tutor_id,
    'inquiry',
    'New student inquiry',
    student_name || ' requested help with ' || subject_name || '.'
  );
  return new_inquiry_id;
end;
$$;

create or replace function public.create_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.user_role;
  other_role public.user_role;
  existing_id uuid;
  new_id uuid;
begin
  actor_role := public.current_user_role();
  select role into other_role from public.profiles where id = other_user_id;
  if other_role is null then raise exception 'User not found.'; end if;
  if other_user_id = (select auth.uid()) then raise exception 'You cannot message yourself.'; end if;
  if actor_role = 'admin' or actor_role = other_role then
    raise exception 'Conversations must connect one student and one tutor.';
  end if;

  select first_member.conversation_id into existing_id
  from public.conversation_members first_member
  join public.conversation_members second_member
    on second_member.conversation_id = first_member.conversation_id
  where first_member.user_id = (select auth.uid())
    and second_member.user_id = other_user_id
  limit 1;
  if existing_id is not null then return existing_id; end if;

  insert into public.conversations default values returning id into new_id;
  insert into public.conversation_members (conversation_id, user_id, last_read_at)
  values
    (new_id, (select auth.uid()), now()),
    (new_id, other_user_id, null);
  return new_id;
end;
$$;

create or replace function public.send_message(target_conversation_id uuid, message_body text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_message_id uuid;
  sender_name text;
begin
  if not public.is_conversation_member(target_conversation_id) then
    raise exception 'Conversation not found.';
  end if;
  insert into public.messages (conversation_id, sender_id, body)
  values (target_conversation_id, (select auth.uid()), message_body)
  returning id into new_message_id;
  update public.conversations set updated_at = now() where id = target_conversation_id;
  update public.conversation_members set last_read_at = now()
  where conversation_id = target_conversation_id and user_id = (select auth.uid());
  select name into sender_name from public.profiles where id = (select auth.uid());
  insert into public.notifications (user_id, type, title, body)
  select user_id, 'message', 'New message from ' || sender_name, left(message_body, 140)
  from public.conversation_members
  where conversation_id = target_conversation_id and user_id <> (select auth.uid());
  return new_message_id;
end;
$$;

create or replace function public.add_availability(slot_start timestamptz, slot_end timestamptz)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_id uuid;
begin
  if public.current_user_role() <> 'tutor' then raise exception 'Tutor account required.'; end if;
  if slot_start <= now() then raise exception 'Availability must be in the future.'; end if;
  insert into public.availability_slots (tutor_id, start_time, end_time)
  values ((select auth.uid()), slot_start, slot_end)
  returning id into new_id;
  return new_id;
exception
  when exclusion_violation then
    raise exception 'That availability overlaps an existing slot.';
end;
$$;

create or replace function public.remove_availability(slot_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'tutor' then raise exception 'Tutor account required.'; end if;
  delete from public.availability_slots
  where id = slot_id and tutor_id = (select auth.uid()) and status = 'open';
  if not found then raise exception 'Open availability slot not found.'; end if;
end;
$$;

create or replace function public.create_booking(
  selected_tutor_id uuid,
  selected_subject_id text,
  selected_slot_id uuid,
  booking_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_slot public.availability_slots%rowtype;
  new_booking_id uuid;
  student_name text;
begin
  if public.current_user_role() <> 'student' then raise exception 'Student account required.'; end if;
  select * into selected_slot from public.availability_slots
  where id = selected_slot_id and tutor_id = selected_tutor_id
  for update;
  if selected_slot.id is null or selected_slot.status <> 'open' or selected_slot.start_time <= now() then
    raise exception 'That time is no longer available.';
  end if;
  if not exists (
    select 1 from public.tutor_subjects
    where tutor_id = selected_tutor_id and subject_id = selected_subject_id
  ) then raise exception 'Tutor does not cover that subject.'; end if;

  update public.availability_slots set status = 'booked' where id = selected_slot_id;
  insert into public.bookings (
    student_id, tutor_id, subject_id, availability_slot_id,
    start_time, end_time, status, notes
  ) values (
    (select auth.uid()), selected_tutor_id, selected_subject_id, selected_slot_id,
    selected_slot.start_time, selected_slot.end_time, 'requested', booking_notes
  ) returning id into new_booking_id;
  select name into student_name from public.profiles where id = (select auth.uid());
  insert into public.notifications (user_id, type, title, body)
  values (selected_tutor_id, 'booking', 'New session request', student_name || ' requested a tutoring session.');
  return new_booking_id;
exception
  when exclusion_violation then
    raise exception 'That time conflicts with another active booking.';
end;
$$;

create or replace function public.update_booking_status(
  target_booking_id uuid,
  next_status public.booking_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_booking public.bookings%rowtype;
  actor_role public.user_role;
  actor_name text;
  recipient_id uuid;
begin
  select * into current_booking from public.bookings where id = target_booking_id for update;
  if current_booking.id is null then raise exception 'Booking not found.'; end if;
  actor_role := public.current_user_role();
  if not public.is_admin()
    and current_booking.student_id <> (select auth.uid())
    and current_booking.tutor_id <> (select auth.uid()) then
    raise exception 'You cannot view that booking.';
  end if;
  if current_booking.status in ('cancelled', 'completed') then
    raise exception 'That booking can no longer be changed.';
  end if;
  if next_status not in ('confirmed', 'completed', 'cancelled') then
    raise exception 'Unsupported booking status.';
  end if;
  if actor_role = 'student' and next_status <> 'cancelled' then
    raise exception 'Students can only cancel session requests.';
  end if;
  if next_status = 'confirmed' and current_booking.status <> 'requested' then
    raise exception 'Only requested sessions can be confirmed.';
  end if;
  if next_status = 'completed'
    and (actor_role not in ('tutor', 'admin') or current_booking.status <> 'confirmed') then
    raise exception 'Only tutors can complete confirmed sessions.';
  end if;

  update public.bookings set status = next_status where id = target_booking_id;
  if next_status = 'cancelled' and current_booking.availability_slot_id is not null then
    update public.availability_slots set status = 'open'
    where id = current_booking.availability_slot_id and start_time > now();
  end if;
  select name into actor_name from public.profiles where id = (select auth.uid());
  recipient_id := case
    when (select auth.uid()) = current_booking.tutor_id then current_booking.student_id
    else current_booking.tutor_id
  end;
  insert into public.notifications (user_id, type, title, body)
  values (
    recipient_id,
    'booking',
    'Session ' || next_status::text,
    actor_name || ' marked the session as ' || next_status::text || '.'
  );
end;
$$;

create or replace function public.create_curriculum_goal(
  selected_student_id uuid,
  selected_subject_id text,
  goal_title text,
  goal_description text,
  goal_target_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_goal_id uuid;
begin
  if public.current_user_role() <> 'tutor' then raise exception 'Tutor account required.'; end if;
  if not public.has_tutoring_relationship((select auth.uid()), selected_student_id) then
    raise exception 'You can only create goals for your students.';
  end if;
  if not exists (
    select 1 from public.tutor_subjects
    where tutor_id = (select auth.uid()) and subject_id = selected_subject_id
  ) then raise exception 'You do not teach that subject.'; end if;
  insert into public.curriculum_goals (
    student_id, tutor_id, subject_id, title, description, target_date
  ) values (
    selected_student_id, (select auth.uid()), selected_subject_id,
    goal_title, goal_description, goal_target_date
  ) returning id into new_goal_id;
  return new_goal_id;
end;
$$;

create or replace function public.add_progress_entry(
  selected_goal_id uuid,
  selected_booking_id uuid,
  entry_summary text,
  entry_next_steps text,
  entry_mastery integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_goal public.curriculum_goals%rowtype;
  new_entry_id uuid;
begin
  if public.current_user_role() <> 'tutor' then raise exception 'Tutor account required.'; end if;
  select * into selected_goal from public.curriculum_goals
  where id = selected_goal_id and tutor_id = (select auth.uid());
  if selected_goal.id is null then raise exception 'Curriculum goal not found.'; end if;
  if selected_booking_id is not null and not exists (
    select 1 from public.bookings
    where id = selected_booking_id
      and student_id = selected_goal.student_id
      and tutor_id = (select auth.uid())
  ) then raise exception 'Session does not match this student.'; end if;
  insert into public.progress_entries (
    goal_id, booking_id, tutor_id, student_id, summary, next_steps, mastery
  ) values (
    selected_goal_id, selected_booking_id, (select auth.uid()), selected_goal.student_id,
    entry_summary, entry_next_steps, entry_mastery
  ) returning id into new_entry_id;
  update public.curriculum_goals set updated_at = now() where id = selected_goal_id;
  insert into public.notifications (user_id, type, title, body)
  values (selected_goal.student_id, 'progress', 'Progress update posted', left(entry_summary, 180));
  return new_entry_id;
end;
$$;

create or replace function public.admin_set_tutor_approval(target_tutor_id uuid, is_approved boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Admin account required.'; end if;
  update public.tutor_profiles set approved = is_approved where user_id = target_tutor_id;
  if not found then raise exception 'Tutor not found.'; end if;
end;
$$;

create or replace function public.admin_update_inquiry(
  target_inquiry_id uuid,
  new_assigned_tutor_id uuid,
  new_status public.inquiry_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_inquiry public.inquiries%rowtype;
  conversation_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin account required.'; end if;
  select * into current_inquiry from public.inquiries where id = target_inquiry_id;
  if current_inquiry.id is null then raise exception 'Inquiry not found.'; end if;
  if new_assigned_tutor_id is not null and not exists (
    select 1 from public.tutor_profiles tp
    join public.tutor_subjects ts on ts.tutor_id = tp.user_id
    where tp.user_id = new_assigned_tutor_id and tp.approved
      and ts.subject_id = current_inquiry.subject_id
  ) then raise exception 'Assigned tutor must be approved and teach the inquiry subject.'; end if;
  update public.inquiries
  set assigned_tutor_id = new_assigned_tutor_id, status = new_status
  where id = target_inquiry_id;
  select id into conversation_id from public.conversations where inquiry_id = target_inquiry_id;
  if conversation_id is not null and new_assigned_tutor_id is not null then
    insert into public.conversation_members (conversation_id, user_id)
    values (conversation_id, new_assigned_tutor_id)
    on conflict do nothing;
  end if;
end;
$$;

create or replace function public.admin_tutor_overview()
returns table (
  id uuid,
  name text,
  email text,
  school text,
  headline text,
  approved boolean,
  hourly_rate integer,
  updated_at timestamptz,
  subject_ids text[]
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Admin account required.'; end if;
  return query
  select
    profile.id,
    profile.name,
    auth_user.email::text,
    tutor.school,
    tutor.headline,
    tutor.approved,
    tutor.hourly_rate,
    tutor.updated_at,
    coalesce(array_agg(subject.subject_id) filter (where subject.subject_id is not null), '{}')
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  join public.tutor_profiles tutor on tutor.user_id = profile.id
  left join public.tutor_subjects subject on subject.tutor_id = profile.id
  group by profile.id, profile.name, auth_user.email, tutor.school, tutor.headline,
    tutor.approved, tutor.hourly_rate, tutor.updated_at
  order by tutor.approved, profile.name;
end;
$$;

revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.has_tutoring_relationship(uuid, uuid) to anon, authenticated;
grant execute on function public.update_student_profile(text, text, text, text, text) to authenticated;
grant execute on function public.update_tutor_profile(text, text, text, text, text, text, integer, text, text[]) to authenticated;
grant execute on function public.create_inquiry(uuid, text, text, text) to authenticated;
grant execute on function public.create_conversation(uuid) to authenticated;
grant execute on function public.send_message(uuid, text) to authenticated;
grant execute on function public.add_availability(timestamptz, timestamptz) to authenticated;
grant execute on function public.remove_availability(uuid) to authenticated;
grant execute on function public.create_booking(uuid, text, uuid, text) to authenticated;
grant execute on function public.update_booking_status(uuid, public.booking_status) to authenticated;
grant execute on function public.create_curriculum_goal(uuid, text, text, text, date) to authenticated;
grant execute on function public.add_progress_entry(uuid, uuid, text, text, integer) to authenticated;
grant execute on function public.admin_set_tutor_approval(uuid, boolean) to authenticated;
grant execute on function public.admin_update_inquiry(uuid, uuid, public.inquiry_status) to authenticated;
grant execute on function public.admin_tutor_overview() to authenticated;

insert into public.subjects (id, slug, name, category) values
  ('subject-math', 'mathematics', 'Mathematics', 'Core academics'),
  ('subject-biology', 'biology', 'Biology', 'Science'),
  ('subject-chemistry', 'chemistry', 'Chemistry', 'Science'),
  ('subject-cs', 'computer-science', 'Computer Science', 'Technology'),
  ('subject-econ', 'economics', 'Economics', 'Social science'),
  ('subject-english', 'english', 'English', 'Humanities'),
  ('subject-writing', 'writing', 'Writing', 'Humanities'),
  ('subject-policy', 'public-policy', 'Public Policy', 'Social science'),
  ('subject-cognitive', 'cognitive-science', 'Cognitive Science', 'Science'),
  ('subject-data', 'data-analytics', 'Data Analytics', 'Technology'),
  ('subject-business', 'business', 'Business', 'Social science'),
  ('subject-music', 'music', 'Music', 'Arts'),
  ('subject-admissions', 'college-admissions', 'College Admissions', 'Mentorship')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end;
$$;
