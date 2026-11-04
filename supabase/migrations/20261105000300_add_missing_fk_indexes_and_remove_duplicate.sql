alter table public.admin_roles drop constraint if exists admin_roles_scope_unique;

create index if not exists academic_schemes_authority_idx on public.academic_schemes(authority_institution_id);
create index if not exists audit_logs_actor_user_idx on public.audit_logs(actor_user_id);
create index if not exists audit_logs_institution_idx on public.audit_logs(institution_id);
create index if not exists bookmarks_paper_idx on public.bookmarks(paper_id);
create index if not exists offerings_awarding_institution_idx on public.institution_course_offerings(awarding_institution_id);
create index if not exists offerings_academic_scheme_idx on public.institution_course_offerings(academic_scheme_id);
create index if not exists paper_visibility_created_by_idx on public.paper_institution_visibility(created_by);
create index if not exists paper_processing_jobs_paper_idx on public.paper_processing_jobs(paper_id);
create index if not exists papers_academic_scheme_idx on public.papers(academic_scheme_id);
create index if not exists papers_assessment_type_idx on public.papers(assessment_type_id);
