-- Least-privilege Data API grants for CollegePapers v2.
-- Keep paper, visibility, AI, admin, audit and job tables inaccessible to public roles
-- until their dedicated authorization paths are implemented and tested.

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- Public, non-sensitive catalogue reads only. RLS remains the row-level gate.
grant select on table
  public.institutions,
  public.institution_relationships,
  public.academic_programs,
  public.academic_schemes,
  public.institution_course_offerings,
  public.semesters,
  public.course_subjects,
  public.examination_schemes,
  public.examination_categories,
  public.assessment_types
to anon, authenticated;

-- Authenticated users may access only their own profile/bookmark rows via RLS.
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, delete on table public.bookmarks to authenticated;

-- No public execution of internal trigger helper.
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- Future tables created by the migration owner must not silently inherit broad
-- Data API permissions. Explicit grants are required for every new table.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
