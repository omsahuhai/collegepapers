import React from 'react';
import { redirect } from 'next/navigation';
import Header from '../../../../components/Header';
import SelectionCard from '../../../../components/SelectionCard';
import SelectorList from '../../../../components/SelectorList';
import PaperRow from '../../../../components/PaperRow';
import BackButton from '../../../../components/BackButton';
import { supabase } from '../../../../lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

export default async function FunnelControllerPage({ params }) {
  const { university, slug = [] } = params;

  // 1. Get the university record
  const { data: uniRecord, error: uniError } = await supabase
    .from('universities')
    .select('*')
    .eq('code', university)
    .single();

  if (uniError || !uniRecord) {
    redirect('/');
  }

  // ==========================================
  // LEVEL 2: Select College (or skip if none exist)
  // Triggered when slug is empty []
  // ==========================================
  if (slug.length === 0) {
    const { data: colleges, error: colError } = await supabase
      .from('colleges')
      .select('*')
      .eq('university_id', uniRecord.id)
      .order('name', { ascending: true });

    if (colError) {
      console.error('Error fetching colleges:', colError);
    }

    if (!colleges || colleges.length === 0) {
      // Auto-skip College Step: Go directly to Course Selection under Direct University path
      redirect(`/institutes/${university}/u`);
    }

    return (
      <main className="container animate-fade-in">
        <Header />
        <BackButton href="/" />

        <div className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 700 }}>
            {uniRecord.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Select your college to view available courses and question papers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {colleges.map((college) => (
              <SelectionCard
                key={college.id}
                name={college.name}
                logoUrl={null}
                href={`/institutes/${university}/c/${college.code}`}
                metaText={college.district}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Detect path type (College 'c' vs Direct University 'u')
  const pathType = slug[0]; // 'c' or 'u'
  if (pathType !== 'c' && pathType !== 'u') {
    redirect(`/institutes/${university}`);
  }

  // Define route context variables
  let collegeRecord = null;
  let courseRecord = null;
  let selectedSemester = null;

  // Parse path based on College vs Direct University
  if (pathType === 'c') {
    const collegeCode = slug[1];
    const courseCode = slug[2];
    const semName = slug[3];

    if (!collegeCode) {
      redirect(`/institutes/${university}`);
    }

    // Resolve College Record
    const { data: colData } = await supabase
      .from('colleges')
      .select('*')
      .eq('code', collegeCode)
      .eq('university_id', uniRecord.id)
      .single();

    if (!colData) {
      redirect(`/institutes/${university}`);
    }
    collegeRecord = colData;

    // Resolve Course Record (if provided)
    if (courseCode) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('code', courseCode)
        .eq('college_id', collegeRecord.id)
        .single();
      
      courseRecord = courseData;
    }

    // Resolve Semester (if provided)
    if (semName) {
      selectedSemester = decodeURIComponent(semName).replace('-', ' ');
    }
  } else {
    // Direct University path ('u')
    const courseCode = slug[1];
    const semName = slug[2];

    // Resolve Course Record (if provided)
    if (courseCode) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('code', courseCode)
        .eq('university_id', uniRecord.id)
        .is('college_id', null)
        .single();

      courseRecord = courseData;
    }

    // Resolve Semester (if provided)
    if (semName) {
      selectedSemester = decodeURIComponent(semName).replace('-', ' ');
    }
  }

  // ==========================================
  // LEVEL 3: Select Course
  // ==========================================
  if (!courseRecord) {
    const query = supabase.from('courses').select('*');
    if (collegeRecord) {
      query.eq('college_id', collegeRecord.id);
    } else {
      query.eq('university_id', uniRecord.id).is('college_id', null);
    }

    const { data: courses } = await query.order('name', { ascending: true });
    const backUrl = collegeRecord ? `/institutes/${university}` : `/`;

    return (
      <main className="container animate-fade-in">
        <Header />
        <BackButton href={backUrl} />

        <div className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem', fontWeight: 700 }}>
            {collegeRecord ? collegeRecord.name : uniRecord.name}
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Course Selection
          </span>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {courses && courses.length > 0 ? (
              courses.map((course) => {
                const href = collegeRecord
                  ? `/institutes/${university}/c/${collegeRecord.code}/${course.code}`
                  : `/institutes/${university}/u/${course.code}`;
                return (
                  <SelectorList
                    key={course.id}
                    title={course.name}
                    subtitle={course.degree_level}
                    href={href}
                  />
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No courses available at this moment.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // LEVEL 4: Select Semester
  // ==========================================
  if (!selectedSemester) {
    const { data: semestersData } = await supabase
      .from('papers')
      .select('semester')
      .eq('university_id', uniRecord.id)
      .eq('course_id', courseRecord.id)
      .eq('is_published', true)
      .order('semester', { ascending: true });

    const semesters = Array.from(new Set(semestersData?.map((p) => p.semester) || []));

    const backUrl = collegeRecord
      ? `/institutes/${university}/c/${collegeRecord.code}`
      : `/institutes/${university}/u`;

    return (
      <main className="container animate-fade-in">
        <Header />
        <BackButton href={backUrl} />

        <div className="glass-panel">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem', fontWeight: 700 }}>
            {courseRecord.name}
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {collegeRecord ? collegeRecord.name : uniRecord.name} &bull; Select Semester
          </span>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {semesters.length > 0 ? (
              semesters.map((sem) => {
                const semSlug = encodeURIComponent(sem.replace(' ', '-'));
                const href = collegeRecord
                  ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}/${semSlug}`
                  : `/institutes/${university}/u/${courseRecord.code}/${semSlug}`;
                return (
                  <SelectorList
                    key={sem}
                    title={sem}
                    subtitle="Previous Year Questions"
                    href={href}
                  />
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No semesters or question papers uploaded yet. Check back soon!
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // LEVEL 5: Display Papers
  // ==========================================
  const papersQuery = supabase
    .from('papers')
    .select('*')
    .eq('university_id', uniRecord.id)
    .eq('course_id', courseRecord.id)
    .eq('semester', selectedSemester)
    .eq('is_published', true);

  if (collegeRecord) {
    papersQuery.eq('college_id', collegeRecord.id);
  }

  const { data: papers } = await papersQuery.order('subject_name', { ascending: true });

  const backUrl = collegeRecord
    ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}`
    : `/institutes/${university}/u/${courseRecord.code}`;

  return (
    <main className="container animate-fade-in">
      <Header />
      <BackButton href={backUrl} />

      <div className="glass-panel">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem', fontWeight: 700 }}>
          {selectedSemester} Question Papers
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {courseRecord.name} &bull; {collegeRecord ? collegeRecord.name : uniRecord.name}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {papers && papers.length > 0 ? (
            papers.map((paper) => (
              <PaperRow key={paper.id} paper={paper} />
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No question papers uploaded for this semester yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
