-- CoTeach Supabase Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    teacher_id TEXT UNIQUE, -- Custom teacher-uuid string
    avatar_url TEXT,
    admin BOOLEAN DEFAULT false,
    organization BOOLEAN DEFAULT false,
    blocked BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    trial_used BOOLEAN DEFAULT false,
    school_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Schools Table
CREATE TABLE IF NOT EXISTS public.schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_email_domain TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT,
    class_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT,
    school_id TEXT,
    title TEXT NOT NULL,
    subject TEXT,
    class_name TEXT,
    month TEXT,
    date TEXT,
    status TEXT DEFAULT 'draft',
    length INTEGER,
    plan JSONB DEFAULT '[]'::jsonb,
    transcripts JSONB DEFAULT '[]'::jsonb,
    source_files JSONB DEFAULT '[]'::jsonb,
    final_note JSONB,
    homework TEXT,
    homework_due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Saved Notes Table
CREATE TABLE IF NOT EXISTS public.saved_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT,
    title TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    class_level TEXT,
    date TEXT,
    homework TEXT,
    homework_due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Licenses Table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    max_active_users INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ,
    demo_mode BOOLEAN DEFAULT false,
    school_id TEXT,
    assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. OpenRouter Usage Events
CREATE TABLE IF NOT EXISTS public.openrouter_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT,
    school_id TEXT,
    lesson_id UUID,
    feature TEXT,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    base_amount_pln NUMERIC(10,5),
    provider_cost_usd NUMERIC(10,5),
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    note_id UUID REFERENCES public.saved_notes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Quiz Results Table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    teacher_id TEXT,
    student_name TEXT,
    total_points NUMERIC(5,2),
    max_points NUMERIC(5,2),
    answers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Settings
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.openrouter_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Manage own classes" ON public.classes;
DROP POLICY IF EXISTS "Manage own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Manage own notes" ON public.saved_notes;
DROP POLICY IF EXISTS "Manage own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Manage own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "View own usage" ON public.openrouter_usage_events;
DROP POLICY IF EXISTS "View assigned license" ON public.licenses;
DROP POLICY IF EXISTS "View school" ON public.schools;

-- Policies with robust type handling
CREATE POLICY "Manage own profile" ON public.profiles 
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Manage own classes" ON public.classes 
    FOR ALL USING (teacher_id IN (SELECT teacher_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "Manage own lessons" ON public.lessons 
    FOR ALL USING (teacher_id IN (SELECT teacher_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "Manage own notes" ON public.saved_notes 
    FOR ALL USING (teacher_id IN (SELECT teacher_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "Manage own quizzes" ON public.quizzes 
    FOR ALL USING (teacher_id IN (SELECT teacher_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "Manage own quiz results" ON public.quiz_results 
    FOR ALL USING (teacher_id IN (SELECT teacher_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "View own usage" ON public.openrouter_usage_events
    FOR SELECT USING (teacher_id IN (SELECT teacher_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "View assigned license" ON public.licenses
    FOR SELECT USING (assigned_user_id = auth.uid() OR school_id IN (SELECT school_id FROM public.profiles WHERE id::text = auth.uid()::text));

CREATE POLICY "View school" ON public.schools
    FOR SELECT USING (id IN (SELECT school_id FROM public.profiles WHERE id::text = auth.uid()::text));

-- Bezpieczne dodanie kolumn dla istniejących tabel
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS homework TEXT;
ALTER TABLE public.saved_notes ADD COLUMN IF NOT EXISTS homework TEXT;

-- Natychmiastowe odświeżenie pamięci podręcznej (Schema Cache)
NOTIFY pgrst, 'reload schema';
