-- CollegePapers database v2: clean development baseline.
-- CBCS is the initial curriculum scheme code; do not seed nep-2020.
create extension if not exists pgcrypto;

create type public.institution_type as enum ('university','affiliated_college','autonomous_college');
create type public.institution_relationship_type as enum ('affiliated_to','constituent_of','partner_of');
create type public.offering_role as enum ('awarding_authority','teaching_institution');
create type public.examination_category_code as enum ('semester_exam','internal_exams');
create type public.student_category_code as enum ('regular','private');
create type public.visibility_source as enum ('automatic','manual');
create type public.visibility_decision as enum ('include','exclude');
create type public.paper_processing_status as enum ('pending','processing','completed','failed');

create table public.institutions (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 name text not null,
 institution_type public.institution_type not null,
 short_name text, logo_url text, website_url text, address text,
 district text, state text not null default 'Chhattisgarh',
 country_code char(2) not null default 'IN',
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint institutions_code_format check (code = lower(code) and code ~ '^[a-z0-9][a-z0-9_-]*$'),
 constraint institutions_name_nonempty check (length(trim(name)) > 0)
);

create table public.institution_relationships (
 id uuid primary key default gen_random_uuid(),
 parent_institution_id uuid not null references public.institutions(id) on delete restrict,
 child_institution_id uuid not null references public.institutions(id) on delete restrict,
 relationship_type public.institution_relationship_type not null,
 valid_from date, valid_until date, created_at timestamptz not null default now(),
 constraint institution_relationships_no_self check (parent_institution_id <> child_institution_id),
 constraint institution_relationships_unique unique (parent_institution_id,child_institution_id,relationship_type),
 constraint institution_relationships_dates check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table public.academic_programs (
 id uuid primary key default gen_random_uuid(),
 code text not null unique, name text not null, award_name text, degree_level text,
 description text, is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint academic_programs_code_format check (code = lower(code) and code ~ '^[a-z0-9][a-z0-9_-]*$'),
 constraint academic_programs_name_nonempty check (length(trim(name)) > 0)
);

create table public.academic_schemes (
 id uuid primary key default gen_random_uuid(),
 code text not null unique, name text not null, description text,
 authority_institution_id uuid references public.institutions(id) on delete restrict,
 effective_from date, effective_until date,
 metadata jsonb not null default '{}'::jsonb, is_active boolean not null default true,
 created_at timestamptz not null default now(),
 constraint academic_schemes_code_format check (code = lower(code) and code ~ '^[a-z0-9][a-z0-9_-]*$'),
 constraint academic_schemes_dates check (effective_until is null or effective_from is null or effective_until >= effective_from)
);

create table public.institution_course_offerings (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid not null references public.institutions(id) on delete restrict,
 academic_program_id uuid not null references public.academic_programs(id) on delete restrict,
 awarding_institution_id uuid not null references public.institutions(id) on delete restrict,
 examination_authority_id uuid not null references public.institutions(id) on delete restrict,
 academic_scheme_id uuid not null references public.academic_schemes(id) on delete restrict,
 role public.offering_role not null default 'teaching_institution',
 code text not null, display_name text,
 admission_year_start integer, admission_year_end integer,
 is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint offering_code_format check (code = lower(code) and code ~ '^[a-z0-9][a-z0-9_-]*$'),
 constraint offering_years check (admission_year_end is null or admission_year_start is null or admission_year_end >= admission_year_start),
 constraint offering_unique unique (institution_id,academic_program_id,academic_scheme_id,code)
);

create table public.semesters (
 id uuid primary key default gen_random_uuid(),
 academic_scheme_id uuid not null references public.academic_schemes(id) on delete restrict,
 semester_number smallint not null, name text not null, display_order smallint not null,
 created_at timestamptz not null default now(),
 constraint semesters_number_positive check (semester_number > 0),
 constraint semesters_order_positive check (display_order > 0),
 constraint semesters_scheme_number_unique unique (academic_scheme_id,semester_number),
 constraint semesters_scheme_order_unique unique (academic_scheme_id,display_order)
);

create table public.course_subjects (
 id uuid primary key default gen_random_uuid(),
 institution_course_offering_id uuid not null references public.institution_course_offerings(id) on delete restrict,
 semester_id uuid not null references public.semesters(id) on delete restrict,
 subject_code text not null, subject_name text not null, subject_type text,
 credits numeric(5,2), syllabus_unit_count smallint,
 is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint course_subjects_code_nonempty check (length(trim(subject_code)) > 0),
 constraint course_subjects_name_nonempty check (length(trim(subject_name)) > 0),
 constraint course_subjects_credits check (credits is null or credits >= 0),
 constraint course_subjects_units check (syllabus_unit_count is null or syllabus_unit_count >= 0),
 constraint course_subjects_unique unique (institution_course_offering_id,semester_id,subject_code)
);

create table public.examination_schemes (
 id uuid primary key default gen_random_uuid(),
 authority_institution_id uuid not null references public.institutions(id) on delete restrict,
 academic_scheme_id uuid not null references public.academic_schemes(id) on delete restrict,
 name text not null, code text not null, is_active boolean not null default true,
 created_at timestamptz not null default now(),
 constraint examination_schemes_unique unique (authority_institution_id,academic_scheme_id,code)
);

create table public.examination_categories (
 id uuid primary key default gen_random_uuid(),
 examination_scheme_id uuid not null references public.examination_schemes(id) on delete restrict,
 category_code public.examination_category_code not null,
 display_name text not null, description text, is_active boolean not null default true,
 display_order smallint not null default 1, created_at timestamptz not null default now(),
 constraint examination_categories_unique unique (examination_scheme_id,category_code),
 constraint examination_categories_order_positive check (display_order > 0),
 constraint examination_categories_label check (
  (category_code = 'semester_exam' and display_name = 'Semester Exam')
  or (category_code = 'internal_exams' and display_name = 'Internal Exams')
 )
);

create table public.assessment_types (
 id uuid primary key default gen_random_uuid(),
 examination_category_id uuid not null references public.examination_categories(id) on delete restrict,
 institution_id uuid not null references public.institutions(id) on delete restrict,
 code text not null, name text not null, display_order smallint not null default 1,
 is_active boolean not null default true, created_at timestamptz not null default now(),
 constraint assessment_types_code_nonempty check (length(trim(code)) > 0),
 constraint assessment_types_name_nonempty check (length(trim(name)) > 0),
 constraint assessment_types_order_positive check (display_order > 0),
 constraint assessment_types_unique unique (examination_category_id,institution_id,code)
);

create table public.papers (
 id uuid primary key default gen_random_uuid(),
 examination_scheme_id uuid not null references public.examination_schemes(id) on delete restrict,
 examination_category_id uuid not null references public.examination_categories(id) on delete restrict,
 assessment_type_id uuid references public.assessment_types(id) on delete restrict,
 examination_authority_id uuid not null references public.institutions(id) on delete restrict,
 academic_program_id uuid not null references public.academic_programs(id) on delete restrict,
 academic_scheme_id uuid not null references public.academic_schemes(id) on delete restrict,
 semester_id uuid not null references public.semesters(id) on delete restrict,
 course_subject_id uuid not null references public.course_subjects(id) on delete restrict,
 examination_session text not null, examination_year smallint, title text,
 storage_bucket text not null default 'papers', storage_path text not null,
 original_filename text, mime_type text not null default 'application/pdf',
 file_size_bytes bigint, checksum_sha256 text, page_count smallint,
 download_count bigint not null default 0, is_published boolean not null default false,
 published_at timestamptz, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint papers_storage_unique unique (storage_bucket,storage_path),
 constraint papers_file_size_nonnegative check (file_size_bytes is null or file_size_bytes >= 0),
 constraint papers_download_count_nonnegative check (download_count >= 0),
 constraint papers_page_count_positive check (page_count is null or page_count > 0),
 constraint papers_year_range check (examination_year is null or examination_year between 1900 and 2200),
 constraint papers_pdf_mime check (mime_type = 'application/pdf'),
 constraint papers_checksum_format check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
 constraint papers_publication_timestamp check (not is_published or published_at is not null)
);

create table public.paper_student_categories (
 paper_id uuid not null references public.papers(id) on delete cascade,
 student_category public.student_category_code not null,
 created_at timestamptz not null default now(),
 primary key (paper_id,student_category)
);

create table public.paper_institution_visibility (
 paper_id uuid not null references public.papers(id) on delete cascade,
 institution_id uuid not null references public.institutions(id) on delete cascade,
 source public.visibility_source not null, decision public.visibility_decision not null,
 reason text, created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key (paper_id,institution_id,source)
);

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text, avatar_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.bookmarks (
 user_id uuid not null references auth.users(id) on delete cascade,
 paper_id uuid not null references public.papers(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (user_id,paper_id)
);

create table public.admin_roles (
 user_id uuid not null references auth.users(id) on delete cascade,
 institution_id uuid references public.institutions(id) on delete cascade,
 role text not null, created_at timestamptz not null default now(),
 constraint admin_roles_role_check check (role in ('super_admin','institution_admin','paper_editor')),
 constraint admin_roles_scope_unique unique (user_id,institution_id,role)
);

create table public.audit_logs (
 id bigint generated always as identity primary key,
 actor_user_id uuid references auth.users(id) on delete set null,
 institution_id uuid references public.institutions(id) on delete set null,
 action text not null, entity_type text not null, entity_id uuid,
 before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);

create table public.paper_intelligence (
 id uuid primary key default gen_random_uuid(),
 paper_id uuid not null unique references public.papers(id) on delete cascade,
 status public.paper_processing_status not null default 'pending',
 extracted_text text, summary jsonb, syllabus_weightage jsonb, topic_frequency jsonb,
 model_provider text, model_name text, prompt_version text, error_message text,
 processed_at timestamptz, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.paper_questions (
 id uuid primary key default gen_random_uuid(),
 paper_intelligence_id uuid not null references public.paper_intelligence(id) on delete cascade,
 question_number text, question_text text not null, normalized_text text,
 marks numeric(6,2), section_label text, unit_reference text,
 topic_tags text[] not null default '{}', display_order integer not null default 1,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 constraint paper_questions_marks_nonnegative check (marks is null or marks >= 0),
 constraint paper_questions_order_positive check (display_order > 0)
);

create table public.paper_processing_jobs (
 id uuid primary key default gen_random_uuid(),
 paper_id uuid not null references public.papers(id) on delete cascade,
 status public.paper_processing_status not null default 'pending',
 attempt_count smallint not null default 0, scheduled_at timestamptz not null default now(),
 started_at timestamptz, finished_at timestamptz, error_message text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint paper_processing_attempt_nonnegative check (attempt_count >= 0)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
 new.updated_at = now();
 return new;
end;
$$;

do $$
declare t text;
begin
 foreach t in array array[
  'institutions','academic_programs','institution_course_offerings','course_subjects',
  'assessment_types','papers','paper_institution_visibility','profiles',
  'paper_intelligence','paper_processing_jobs'
 ]
 loop
  execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t);
 end loop;
end $$;

create index institution_relationships_child_idx on public.institution_relationships(child_institution_id);
create index institution_course_offerings_program_idx on public.institution_course_offerings(academic_program_id);
create index institution_course_offerings_authority_idx on public.institution_course_offerings(examination_authority_id);
create index institution_course_offerings_active_idx on public.institution_course_offerings(institution_id,is_active);
create index semesters_scheme_idx on public.semesters(academic_scheme_id);
create index course_subjects_semester_idx on public.course_subjects(semester_id);
create index examination_schemes_scheme_idx on public.examination_schemes(academic_scheme_id);
create index examination_categories_scheme_idx on public.examination_categories(examination_scheme_id);
create index assessment_types_institution_idx on public.assessment_types(institution_id);
create index papers_category_subject_session_idx on public.papers(examination_category_id,course_subject_id,examination_session);
create index papers_authority_year_idx on public.papers(examination_authority_id,examination_year desc);
create index papers_published_idx on public.papers(created_at desc) where is_published;
create index papers_scheme_idx on public.papers(examination_scheme_id);
create index papers_program_idx on public.papers(academic_program_id);
create index papers_semester_idx on public.papers(semester_id);
create index papers_subject_idx on public.papers(course_subject_id);
create index paper_visibility_institution_idx on public.paper_institution_visibility(institution_id,decision);
create index admin_roles_institution_idx on public.admin_roles(institution_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type,entity_id);
create index paper_questions_intelligence_order_idx on public.paper_questions(paper_intelligence_id,display_order);
create index paper_processing_jobs_status_schedule_idx on public.paper_processing_jobs(status,scheduled_at);

alter table public.institutions enable row level security;
alter table public.institution_relationships enable row level security;
alter table public.academic_programs enable row level security;
alter table public.academic_schemes enable row level security;
alter table public.institution_course_offerings enable row level security;
alter table public.semesters enable row level security;
alter table public.course_subjects enable row level security;
alter table public.examination_schemes enable row level security;
alter table public.examination_categories enable row level security;
alter table public.assessment_types enable row level security;
alter table public.papers enable row level security;
alter table public.paper_student_categories enable row level security;
alter table public.paper_institution_visibility enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.admin_roles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.paper_intelligence enable row level security;
alter table public.paper_questions enable row level security;
alter table public.paper_processing_jobs enable row level security;

create policy "public_read_active_institutions" on public.institutions for select to anon,authenticated using (is_active);
create policy "public_read_institution_relationships" on public.institution_relationships for select to anon,authenticated using (
 exists(select 1 from public.institutions i where i.id=parent_institution_id and i.is_active)
 and exists(select 1 from public.institutions i where i.id=child_institution_id and i.is_active)
);
create policy "public_read_active_programs" on public.academic_programs for select to anon,authenticated using (is_active);
create policy "public_read_active_schemes" on public.academic_schemes for select to anon,authenticated using (is_active);
create policy "public_read_active_offerings" on public.institution_course_offerings for select to anon,authenticated using (
 is_active and exists(select 1 from public.institutions i where i.id=institution_id and i.is_active)
);
create policy "public_read_semesters" on public.semesters for select to anon,authenticated using (true);
create policy "public_read_active_subjects" on public.course_subjects for select to anon,authenticated using (
 is_active and exists(select 1 from public.institution_course_offerings o where o.id=institution_course_offering_id and o.is_active)
);
create policy "public_read_active_exam_schemes" on public.examination_schemes for select to anon,authenticated using (is_active);
create policy "public_read_exam_categories" on public.examination_categories for select to anon,authenticated using (
 is_active and exists(select 1 from public.examination_schemes s where s.id=examination_scheme_id and s.is_active)
);
create policy "public_read_active_assessment_types" on public.assessment_types for select to anon,authenticated using (is_active);

-- Temporary baseline: visibility is deliberately not exposed to clients.
-- Public paper SELECT remains disabled pending the tested visibility RPC migration.
create policy "users_read_own_profile" on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy "users_insert_own_profile" on public.profiles for insert to authenticated with check (id=(select auth.uid()));
create policy "users_update_own_profile" on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy "users_read_own_bookmarks" on public.bookmarks for select to authenticated using (user_id=(select auth.uid()));
create policy "users_manage_own_bookmarks" on public.bookmarks for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "admins_read_admin_roles" on public.admin_roles for select to authenticated using (
 exists(select 1 from public.admin_roles ar where ar.user_id=(select auth.uid()) and ar.role='super_admin')
);
create policy "super_admin_read_audit_logs" on public.audit_logs for select to authenticated using (
 exists(select 1 from public.admin_roles ar where ar.user_id=(select auth.uid()) and ar.role='super_admin')
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('papers','papers',false,52428800,array['application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
