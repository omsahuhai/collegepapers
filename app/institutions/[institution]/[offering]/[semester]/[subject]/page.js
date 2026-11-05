import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

const validCategories = new Set(['regular', 'private']);

export default async function SubjectPapersPage({ params, searchParams }) {
  const { institution: institutionCode, offering: offeringCode, semester: semesterNumber, subject: subjectCode } = await params;
  const query = await searchParams;
  const category = validCategories.has(String(query?.category || '').toLowerCase())
    ? String(query.category).toLowerCase()
    : 'regular';

  const { data: institution } = await supabase.from('institutions')
    .select('id, code, name').eq('code', institutionCode).eq('is_active', true).maybeSingle();
  if (!institution) notFound();

  const { data: offering } = await supabase.from('institution_course_offerings')
    .select('id, code, display_name, academic_scheme_id, academic_programs(name), academic_schemes(name)')
    .eq('institution_id', institution.id).eq('code', offeringCode).eq('is_active', true).maybeSingle();
  if (!offering) notFound();

  const { data: semester } = await supabase.from('semesters')
    .select('id, semester_number, name')
    .eq('academic_scheme_id', offering.academic_scheme_id)
    .eq('semester_number', Number(semesterNumber)).maybeSingle();
  if (!semester) notFound();

  const { data: subject } = await supabase.from('course_subjects')
    .select('id, subject_code, subject_name')
    .eq('institution_course_offering_id', offering.id).eq('semester_id', semester.id)
    .eq('subject_code', subjectCode).eq('is_active', true).maybeSingle();
  if (!subject) notFound();

  const { data: papers, error } = await supabase.from('papers')
    .select('id, title, examination_session, examination_year, file_size_bytes, examination_categories(category_code, display_name), assessment_types(name), paper_student_categories(student_category)')
    .eq('course_subject_id', subject.id).eq('is_published', true)
    .order('examination_year', { ascending: false });

  let visiblePapers = [];
  if (!error && papers?.length) {
    const checks = await Promise.all(papers.map(async (paper) => {
      const { data: allowed, error: eligibilityError } = await supabase.rpc('is_paper_visible_to_institution', {
        p_paper_id: paper.id, p_institution_id: institution.id, p_student_category: category,
      });
      return !eligibilityError && allowed === true ? paper : null;
    }));
    visiblePapers = checks.filter(Boolean);
  }

  return (
    <main className="container animate-fade-in">
      <nav style={{ marginBottom: '1rem' }}><Link href={`/institutions/${institution.code}`}>← {institution.name}</Link></nav>
      <header className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{offering.display_name || offering.academic_programs?.name} · Semester {semester.semester_number}</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '.4rem 0' }}>{subject.subject_name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{subject.subject_code}</p>
        <form method="GET" style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <label htmlFor="category">Student category</label>
          <select id="category" name="category" defaultValue={category} style={{ padding: '.65rem', borderRadius: '8px' }}>
            <option value="regular">Regular</option>
            <option value="private">Private</option>
          </select>
          <button type="submit" className="glass-panel" style={{ padding: '.65rem 1rem', cursor: 'pointer' }}>Apply</button>
        </form>
      </header>
      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Available question papers</h2>
        {error ? <p role="alert">Papers are temporarily unavailable. Please retry.</p> : null}
        {!error && visiblePapers.length === 0 ? <p>No published papers are currently available for this subject and student category.</p> : null}
        <div style={{ display: 'grid', gap: '.75rem' }}>
          {visiblePapers.map((paper) => (
            <article key={paper.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <strong>{paper.title || paper.examination_categories?.display_name || 'Question paper'}</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '.25rem' }}>{paper.examination_session}{paper.examination_year ? ` · ${paper.examination_year}` : ''}{paper.assessment_types?.name ? ` · ${paper.assessment_types.name}` : ''}</p>
              </div>
              <a className="glass-panel" style={{ padding: '.65rem 1rem', textDecoration: 'none' }} href={`/api/download?id=${paper.id}&institution=${institution.id}&category=${category}`}>Download PDF</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
