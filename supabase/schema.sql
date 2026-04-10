create table if not exists public.lessons (
  id uuid primary key,
  school_id text not null,
  teacher_id uuid not null,
  title text not null,
  subject text not null,
  month text not null,
  date date not null,
  status text not null,
  source_files jsonb not null default '[]'::jsonb,
  plan jsonb not null default '[]'::jsonb,
  transcripts jsonb not null default '[]'::jsonb,
  final_note jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_cost_events (
  id uuid primary key,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  provider text not null,
  amount_pln numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists lessons_teacher_id_idx on public.lessons (teacher_id);
create index if not exists lesson_cost_events_lesson_id_idx on public.lesson_cost_events (lesson_id);

alter table public.lessons enable row level security;
alter table public.lesson_cost_events enable row level security;

drop policy if exists "lessons_select_own" on public.lessons;
drop policy if exists "lessons_insert_own" on public.lessons;
drop policy if exists "lessons_update_own" on public.lessons;
drop policy if exists "lessons_delete_own" on public.lessons;

create policy "lessons_select_own" on public.lessons for select using (auth.uid() = teacher_id);
create policy "lessons_insert_own" on public.lessons for insert with check (auth.uid() = teacher_id);
create policy "lessons_update_own" on public.lessons for update using (auth.uid() = teacher_id);
create policy "lessons_delete_own" on public.lessons for delete using (auth.uid() = teacher_id);

drop policy if exists "costs_select_own" on public.lesson_cost_events;
drop policy if exists "costs_insert_own" on public.lesson_cost_events;

create policy "costs_select_own" on public.lesson_cost_events for select using (
  exists (select 1 from public.lessons l where l.id = lesson_id and l.teacher_id = auth.uid())
);
create policy "costs_insert_own" on public.lesson_cost_events for insert with check (
  exists (select 1 from public.lessons l where l.id = lesson_id and l.teacher_id = auth.uid())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid() is not null and (storage.foldername (name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername (name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects for delete using (
  bucket_id = 'avatars' and (storage.foldername (name))[1] = auth.uid()::text
);
