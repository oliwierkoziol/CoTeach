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
  admin boolean not null default false,
  blocked boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists blocked boolean not null default false;

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

create policy "final_notes_select_own" on public.final_notes for select using (auth.uid()::text = teacher_id);
create policy "final_notes_insert_own" on public.final_notes for insert with check (auth.uid()::text = teacher_id);
create policy "final_notes_update_own" on public.final_notes for update using (auth.uid()::text = teacher_id);
create policy "final_notes_delete_own" on public.final_notes for delete using (auth.uid()::text = teacher_id);
