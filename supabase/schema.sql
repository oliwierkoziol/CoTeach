create extension if not exists "pgcrypto";

create table if not exists public.lessons (
  id uuid primary key,
  school_id text not null,
  teacher_id text not null,
  title text not null,
  subject text not null,
  month text not null,
  date date not null,
  status text not null default 'draft',
  source_files jsonb not null default '[]'::jsonb,
  plan jsonb not null default '[]'::jsonb,
  transcripts jsonb not null default '[]'::jsonb,
  final_note jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists lessons_status_idx on public.lessons(status);
create index if not exists lessons_updated_at_idx on public.lessons(updated_at desc);
create index if not exists lessons_teacher_idx on public.lessons(teacher_id);

alter table public.lessons enable row level security;

drop policy if exists "lessons_select_own" on public.lessons;
drop policy if exists "lessons_insert_own" on public.lessons;
drop policy if exists "lessons_update_own" on public.lessons;
drop policy if exists "lessons_delete_own" on public.lessons;

create policy "lessons_select_own" on public.lessons for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = lessons.teacher_id
  )
);
create policy "lessons_insert_own" on public.lessons for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = lessons.teacher_id
  )
);
create policy "lessons_update_own" on public.lessons for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = lessons.teacher_id
  )
);
create policy "lessons_delete_own" on public.lessons for delete using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = lessons.teacher_id
  )
);

create table if not exists public.lesson_cost_events (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  provider text not null,
  amount_pln numeric(10,4) not null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_cost_events_lesson_idx on public.lesson_cost_events(lesson_id);
create index if not exists lesson_cost_events_created_idx on public.lesson_cost_events(created_at desc);

create table if not exists public.final_notes (
  id uuid primary key,
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  teacher_id text not null,
  title text,
  subject text,
  date date,
  html text not null,
  public_path text,
  share_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists final_notes_lesson_idx on public.final_notes(lesson_id);
create index if not exists final_notes_teacher_idx on public.final_notes(teacher_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  teacher_id text,
  admin boolean not null default false,
  blocked boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists blocked boolean not null default false;

alter table public.profiles
  add column if not exists teacher_id text;

create unique index if not exists profiles_teacher_id_unique_idx on public.profiles(teacher_id) where teacher_id is not null;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

alter table public.final_notes enable row level security;

drop policy if exists "final_notes_select_own" on public.final_notes;
drop policy if exists "final_notes_insert_own" on public.final_notes;
drop policy if exists "final_notes_update_own" on public.final_notes;
drop policy if exists "final_notes_delete_own" on public.final_notes;

create policy "final_notes_select_own" on public.final_notes for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = final_notes.teacher_id
  )
);
create policy "final_notes_insert_own" on public.final_notes for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = final_notes.teacher_id
  )
);
create policy "final_notes_update_own" on public.final_notes for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = final_notes.teacher_id
  )
);
create policy "final_notes_delete_own" on public.final_notes for delete using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = final_notes.teacher_id
  )
);

create table if not exists public.saved_notes (
  id uuid primary key,
  teacher_id text not null,
  title text not null,
  subject text not null,
  class_level text,
  content text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_notes_teacher_idx on public.saved_notes(teacher_id);
create index if not exists saved_notes_updated_idx on public.saved_notes(updated_at desc);

alter table public.saved_notes enable row level security;

drop policy if exists "saved_notes_select_own" on public.saved_notes;
drop policy if exists "saved_notes_insert_own" on public.saved_notes;
drop policy if exists "saved_notes_update_own" on public.saved_notes;
drop policy if exists "saved_notes_delete_own" on public.saved_notes;

create policy "saved_notes_select_own" on public.saved_notes for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = saved_notes.teacher_id
  )
);
create policy "saved_notes_insert_own" on public.saved_notes for insert with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = saved_notes.teacher_id
  )
);
create policy "saved_notes_update_own" on public.saved_notes for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = saved_notes.teacher_id
  )
);
create policy "saved_notes_delete_own" on public.saved_notes for delete using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.teacher_id = saved_notes.teacher_id
  )
);

create table if not exists public.user_licenses (
  id text primary key,
  key text not null,
  assigned_user_id uuid,
  max_active_users integer not null default 1,
  expires_at timestamptz not null,
  demo_mode boolean not null default false,
  school_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_licenses_assigned_user_fk foreign key (assigned_user_id) references auth.users(id) on delete cascade
);

create unique index if not exists user_licenses_assigned_user_unique_idx on public.user_licenses(assigned_user_id) where assigned_user_id is not null;
create index if not exists user_licenses_expires_idx on public.user_licenses(expires_at desc);
