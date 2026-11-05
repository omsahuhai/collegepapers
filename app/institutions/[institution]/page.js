import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { institution } = await params;
  const { data } = await supabase.from('institutions').select('name').eq('code', institution).eq('is_active', true).maybeSingle();
  return { title: data ? `Programs at ${data.name} | CollegePapers` : 'Institution | CollegePapers' };
}

export default async function InstitutionPage({ params }) {
  const { institution: code } = await params;
  const { data: institution, error: institutionError } = await supabase
    .from('institutions')
    .select('id, code, name, short_name, institution_type, website_url, district, state')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (institutionError) {
    return <main className="container"><section className="glass-panel" style={{ padding: '2rem' }}><h1>Directory temporarily unavailable</h1><p>Please try again later.</p><Link href="/">Back to institutions</Link></section></main>;
  }
  if (!institution) notFound();

  const { data: offerings, error: offeringsError } = await supabase
    .from('institution_course_offerings')
    .select('id, code, display_name, role, academic_programs(name, code, award_name, degree_level), academic_schemes(name, code), awarding_institution:institutions!institution_course_offerings_awarding_institution_id_fkey(name, code), examination_authority:institutions!institution_course_offerings_examination_authority_id_fkey(name, code)')
    .eq('institution_id', institution.id)
    .eq('is_active', true)
    .order('display_name');

  const offeringIds = (offerings || []).map((item) => item.id);
  const { data: subjectRows } = offeringIds.length
    ? await supabase.from('course_subjects')
        .select('id, institution_course_offering_id, subject_code, subject_name, semester:semesters!inner(id, semester_number, name, academic_scheme_id)')
        .in('institution_course_offering_id', offeringIds)
        .eq('is_active', true)
        .order('subject_name')
    : { data: [] };

  const grouped = (offerings || []).map((offering) => ({
    ...offering,
    subjects: (subjectRows || []).filter((subject) => subject.institution_course_offering_id === offering.id),
  }));

  return (
    <main className="container animate-fade-in">
      <nav style={{ marginBottom: '1rem' }}><Link href="/">← All institutions</Link></nav>
      <header className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Verified academic directory</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '.5rem 0' }}>{institution.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{institution.short_name || institution.code.toUpperCase()} · {institution.institution_type.replaceAll('_', ' ')}{institution.district ? ` · ${institution.district}` : ''}{institution.state ? `, ${institution.state}` : ''}</p>
        {institution.website_url ? <p><a href={institution.website_url} target="_blank" rel="noreferrer">Official website ↗</a></p> : null}
      </header>
      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Programmes and subjects</h2>
        {offeringsError ? <p role="alert">Programme information is temporarily unavailable.</p> : null}
        {!offeringsError && grouped.length === 0 ? <p>No verified programme offerings have been published for this institution yet.</p> : null}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {grouped.map((offering) => {
            const semesters = [...new Map(offering.subjects.map((subject) => [subject.semester.id, subject.semester])).values()].sort((a, b) => a.semester_number - b.semester_number);
            return (
              <article key={offering.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3>{offering.display_name || offering.academic_programs?.name || offering.code}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{offering.academic_programs?.degree_level || offering.academic_programs?.award_name || 'Programme'} · {offering.academic_schemes?.name || 'Academic scheme'}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Awarding authority: {offering.awarding_institution?.name || 'Not specified'} · Examination authority: {offering.examination_authority?.name || 'Not specified'}</p>
                {semesters.length === 0 ? <p>No verified subjects are available for this programme yet.</p> : semesters.map((semester) => (
                  <section key={semester.id} style={{ marginTop: '1rem' }}>
                    <h4>Semester {semester.semester_number}</h4>
                    <ul>{offering.subjects.filter((subject) => subject.semester.id === semester.id).map((subject) => <li key={subject.id}><Link href={`/institutions/${institution.code}/${offering.code}/${semester.semester_number}/${encodeURIComponent(subject.subject_code)}`}>{subject.subject_name}</Link> <span style={{ color: 'var(--text-secondary)' }}>({subject.subject_code})</span></li>)}</ul>
                  </section>
                ))}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
