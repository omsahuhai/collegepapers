-- Enforce cross-table paper consistency and centralize v2 visibility.
-- All paper reads remain server-mediated; this function is not exposed to browser roles.

create or replace function public.validate_paper_academic_consistency()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_category_scheme uuid;
  v_category_code public.examination_category_code;
  v_exam_authority uuid;
  v_exam_scheme uuid;
  v_exam_academic_scheme uuid;
  v_semester_scheme uuid;
  v_subject_offering uuid;
  v_subject_semester uuid;
  v_subject_code text;
  v_offering_program uuid;
  v_offering_scheme uuid;
  v_offering_awarder uuid;
  v_offering_exam_authority uuid;
begin
  select ec.examination_scheme_id, ec.category_code
    into v_category_scheme, v_category_code
  from public.examination_categories ec
  where ec.id = new.examination_category_id;

  select es.authority_institution_id, es.academic_scheme_id
    into v_exam_authority, v_exam_academic_scheme
  from public.examination_schemes es
  where es.id = new.examination_scheme_id;

  if v_category_scheme is distinct from new.examination_scheme_id then
    raise exception 'Paper examination category must belong to its examination scheme';
  end if;

  if v_exam_authority is distinct from new.examination_authority_id
     or v_exam_academic_scheme is distinct from new.academic_scheme_id then
    raise exception 'Paper authority and academic scheme must match its examination scheme';
  end if;

  select s.academic_scheme_id into v_semester_scheme
  from public.semesters s where s.id = new.semester_id;
  if v_semester_scheme is distinct from new.academic_scheme_id then
    raise exception 'Paper semester must belong to its academic scheme';
  end if;

  select cs.institution_course_offering_id, cs.semester_id, cs.subject_code
    into v_subject_offering, v_subject_semester, v_subject_code
  from public.course_subjects cs where cs.id = new.course_subject_id;

  if v_subject_semester is distinct from new.semester_id then
    raise exception 'Paper subject must belong to the selected semester';
  end if;

  select o.academic_program_id, o.academic_scheme_id,
         o.awarding_institution_id, o.examination_authority_id
    into v_offering_program, v_offering_scheme,
         v_offering_awarder, v_offering_exam_authority
  from public.institution_course_offerings o
  where o.id = v_subject_offering;

  if v_offering_program is distinct from new.academic_program_id
     or v_offering_scheme is distinct from new.academic_scheme_id
     or v_offering_exam_authority is distinct from new.examination_authority_id then
    raise exception 'Paper programme, scheme and authority must match its subject offering';
  end if;

  if v_category_code = 'internal_exams' and new.assessment_type_id is null then
    raise exception 'Internal Exams papers require an assessment type';
  end if;

  if new.assessment_type_id is not null and not exists (
    select 1 from public.assessment_types at
    where at.id = new.assessment_type_id
      and at.examination_category_id = new.examination_category_id
  ) then
    raise exception 'Paper assessment type must belong to its examination category';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_paper_academic_consistency on public.papers;
create trigger validate_paper_academic_consistency
before insert or update of examination_scheme_id, examination_category_id,
  examination_authority_id, academic_program_id, academic_scheme_id,
  semester_id, course_subject_id, assessment_type_id
on public.papers
for each row execute function public.validate_paper_academic_consistency();

-- Automatic eligibility is derived from an active offering at the target institution.
-- A manual INCLUDE can grant an exception; a manual EXCLUDE always wins.
-- Student category remains an explicit paper eligibility requirement.
create or replace function public.is_paper_visible_to_institution(
  p_paper_id uuid,
  p_institution_id uuid,
  p_student_category public.student_category_code
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.papers p
    join public.examination_categories ec
      on ec.id = p.examination_category_id
    join public.institutions target
      on target.id = p_institution_id and target.is_active
    where p.id = p_paper_id
      and p.is_published
      and exists (
        select 1
        from public.paper_student_categories psc
        where psc.paper_id = p.id
          and psc.student_category = p_student_category
      )
      and not (ec.category_code = 'internal_exams' and p_student_category = 'private')
      and not exists (
        select 1
        from public.paper_institution_visibility v
        where v.paper_id = p.id
          and v.institution_id = p_institution_id
          and v.source = 'manual'
          and v.decision = 'exclude'
      )
      and (
        exists (
          select 1
          from public.paper_institution_visibility v
          where v.paper_id = p.id
            and v.institution_id = p_institution_id
            and v.source = 'manual'
            and v.decision = 'include'
        )
        or exists (
          select 1
          from public.institution_course_offerings o
          join public.course_subjects target_subject
            on target_subject.institution_course_offering_id = o.id
          join public.course_subjects paper_subject
            on paper_subject.id = p.course_subject_id
          where o.institution_id = p_institution_id
            and o.is_active
            and o.academic_program_id = p.academic_program_id
            and o.academic_scheme_id = p.academic_scheme_id
            and o.awarding_institution_id = p.examination_authority_id
            and o.examination_authority_id = p.examination_authority_id
            and target_subject.is_active
            and target_subject.semester_id = p.semester_id
            and target_subject.subject_code = paper_subject.subject_code
        )
      )
  );
$$;

revoke all on function public.is_paper_visible_to_institution(uuid,uuid,public.student_category_code)
  from public, anon, authenticated;
grant execute on function public.is_paper_visible_to_institution(uuid,uuid,public.student_category_code)
  to service_role;
revoke all on function public.validate_paper_academic_consistency() from public, anon, authenticated;

comment on function public.is_paper_visible_to_institution(uuid,uuid,public.student_category_code)
is 'Server-only paper eligibility check. Manual exclusion vetoes automatic and manual inclusion; Internal Exams are Regular-only.';
