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
