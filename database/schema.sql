-- Universities Table
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo_url TEXT,
    headquarters TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Colleges Table
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE RESTRICT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_autonomous BOOLEAN DEFAULT false,
    district TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    degree_level TEXT, -- 'UG', 'PG', 'Diploma'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Papers Table
CREATE TABLE IF NOT EXISTS public.papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE RESTRICT,
    college_id UUID REFERENCES public.colleges(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    semester TEXT NOT NULL, -- e.g., 'Semester 3', 'Part I'
    examination_session TEXT NOT NULL, -- e.g., 'Nov-Dec 2023'
    exam_type TEXT NOT NULL, -- e.g., 'Regular', 'Supplementary'
    curriculum_scheme TEXT NOT NULL, -- e.g., 'NEP-2020', 'CBCS'
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    file_path TEXT,
    file_size_bytes INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_papers_funnel_active 
ON public.papers(university_id, course_id, semester) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_papers_college_active 
ON public.papers(college_id, course_id, semester) 
WHERE is_published = true;
