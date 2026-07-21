import React from 'react';
import { redirect } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

// Funnel Components
import CollegeSelector from '../../../../components/funnel/CollegeSelector';
import CourseSelector from '../../../../components/funnel/CourseSelector';
import SemesterSelector from '../../../../components/funnel/SemesterSelector';
import SubjectSelector from '../../../../components/funnel/SubjectSelector';
import PaperArchive from '../../../../components/funnel/PaperArchive';


// This catch-all route handles the whole path selection:
// slug = [] -> select college
// slug = [c, college_code] -> select course
// slug = [u] -> direct university course select
// slug = [..., course_code] -> select semester
// slug = [..., sem] -> select subject
// slug = [..., subject] -> show papers
export const revalidate = 3600; // cache for 1 hour

export default async function FunnelControllerPage({ params }) {
  const { university, slug = [] } = params;

  // get the university info (PRSU, CSVTU, etc.)
  const { data: uniRecord, error: uniError } = await supabase
    .from('universities')
    .select('id, code, name, headquarters')
    .eq('code', university)
    .single();

  if (uniError || !uniRecord) {
    redirect('/');
  }

  // --- STEP 1: Select College ---
  // If slug is empty, they just entered /institutes/PRSU. Show colleges.
  if (slug.length === 0) {
    const { data: activePapers } = await supabase
      .from('papers')
      .select('college_id')
      .eq('university_id', uniRecord.id)
      .eq('is_published', true);

    const activeCollegeIds = Array.from(new Set(activePapers?.map(p => p.college_id).filter(Boolean) || []));

    let colleges = [];
    if (activeCollegeIds.length > 0) {
      const { data: collegesData } = await supabase
        .from('colleges')
        .select('id, name, code, district, logo_url')
        .in('id', activeCollegeIds)
        .order('name', { ascending: true });
      colleges = collegesData || [];
    }

    if (!colleges || colleges.length === 0) {
      redirect(`/institutes/${university}/u`);
    }

    return <CollegeSelector university={university} uniRecord={uniRecord} colleges={colleges} />;
  }

  // Check if they are browsing via college (c) or direct university (u)
  const pathType = slug[0];
  if (pathType !== 'c' && pathType !== 'u') {
    redirect(`/institutes/${university}`);
  }

  let collegeRecord = null;
  let courseRecord = null;
  let selectedSemester = null;
  let selectedSubject = null;

  if (pathType === 'c') {
    const collegeCode = slug[1];
    const courseCode = slug[2];
    const semName = slug[3];
    const subjectName = slug[4];

    if (!collegeCode) redirect(`/institutes/${university}`);

    const { data: colData } = await supabase
      .from('colleges')
      .select('id, code, name, district, university_id')
      .eq('code', collegeCode)
      .eq('university_id', uniRecord.id)
      .single();

    if (!colData) redirect(`/institutes/${university}`);
    collegeRecord = colData;

    if (courseCode) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, code, name, degree_level, university_id, college_id')
        .eq('code', courseCode)
        .or(`college_id.eq.${collegeRecord.id},and(university_id.eq.${uniRecord.id},college_id.is.null)`)
        .single();
      courseRecord = courseData;
    }

    if (semName) selectedSemester = decodeURIComponent(semName).replace(/-/g, ' ');
    if (subjectName) selectedSubject = decodeURIComponent(subjectName).replace(/-/g, ' ');
  } else {
    const courseCode = slug[1];
    const semName = slug[2];
    const subjectName = slug[3];

    if (courseCode) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, code, name, degree_level, university_id, college_id')
        .eq('code', courseCode)
        .eq('university_id', uniRecord.id)
        .is('college_id', null)
        .single();
      courseRecord = courseData;
    }

    if (semName) selectedSemester = decodeURIComponent(semName).replace(/-/g, ' ');
    if (subjectName) selectedSubject = decodeURIComponent(subjectName).replace(/-/g, ' ');
  }

  // --- STEP 2: Select Course ---
  if (!courseRecord) {
    let activePapersQuery = supabase
      .from('papers')
      .select('course_id')
      .eq('university_id', uniRecord.id)
      .eq('is_published', true);

    if (collegeRecord) {
      activePapersQuery = activePapersQuery.or(`college_id.eq.${collegeRecord.id},college_id.is.null`);
    } else {
      activePapersQuery = activePapersQuery.is('college_id', null);
    }

    const { data: activePapers } = await activePapersQuery;
    const activeCourseIds = Array.from(new Set(activePapers?.map(p => p.course_id).filter(Boolean) || []));

    let courses = [];
    if (activeCourseIds.length > 0) {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, code, name, degree_level')
        .in('id', activeCourseIds)
        .order('name', { ascending: true });
      courses = coursesData || [];
    }

    return (
      <CourseSelector 
        university={university} 
        uniRecord={uniRecord} 
        collegeRecord={collegeRecord} 
        courses={courses} 
      />
    );
  }

  // --- STEP 3: Select Semester ---
  if (!selectedSemester) {
    let semestersQuery = supabase
      .from('papers')
      .select('semester')
      .eq('university_id', uniRecord.id)
      .eq('course_id', courseRecord.id)
      .eq('is_published', true);

    if (collegeRecord) {
      semestersQuery = semestersQuery.or(`college_id.eq.${collegeRecord.id},college_id.is.null`);
    } else {
      semestersQuery = semestersQuery.is('college_id', null);
    }

    const { data: semestersData } = await semestersQuery.order('semester', { ascending: true });
    const semesters = Array.from(new Set(semestersData?.map((p) => p.semester).filter(Boolean) || []));

    return (
      <SemesterSelector 
        university={university} 
        uniRecord={uniRecord} 
        collegeRecord={collegeRecord} 
        courseRecord={courseRecord} 
        semesters={semesters} 
      />
    );
  }

  // --- STEP 4: Select Subject ---
  if (!selectedSubject) {
    let subjectsQuery = supabase
      .from('papers')
      .select('subject_name')
      .eq('university_id', uniRecord.id)
      .eq('course_id', courseRecord.id)
      .eq('semester', selectedSemester)
      .eq('is_published', true);

    if (collegeRecord) {
      subjectsQuery = subjectsQuery.or(`college_id.eq.${collegeRecord.id},college_id.is.null`);
    } else {
      subjectsQuery = subjectsQuery.is('college_id', null);
    }

    const { data: subjectsData } = await subjectsQuery.order('subject_name', { ascending: true });
    const subjects = Array.from(new Set(subjectsData?.map((p) => p.subject_name).filter(Boolean) || []));

    return (
      <SubjectSelector 
        university={university} 
        uniRecord={uniRecord} 
        collegeRecord={collegeRecord} 
        courseRecord={courseRecord} 
        selectedSemester={selectedSemester} 
        subjects={subjects} 
      />
    );
  }

  // --- STEP 5: Display Papers ---
  let basePapersQuery = supabase
    .from('papers')
    .select('id, subject_name, subject_code, examination_session, exam_type, curriculum_scheme, file_size_bytes, file_path')
    .eq('university_id', uniRecord.id)
    .eq('course_id', courseRecord.id)
    .eq('semester', selectedSemester)
    .eq('subject_name', selectedSubject)
    .eq('is_published', true);

  if (collegeRecord) {
    basePapersQuery = basePapersQuery.or(`college_id.eq.${collegeRecord.id},college_id.is.null`);
  } else {
    basePapersQuery = basePapersQuery.is('college_id', null);
  }

  const { data: allPapers } = await basePapersQuery;

  const examTypes = Array.from(new Set(allPapers?.map(p => p.exam_type).filter(Boolean) || []));
  const extractYear = (session) => session?.match(/\d{4}/)?.[0] || 'Unknown';
  const years = Array.from(new Set(allPapers?.map(p => extractYear(p.examination_session)) || []))
    .sort((a, b) => b.localeCompare(a)); 

  return (
    <React.Suspense fallback={
      <main className="container animate-fade-in">
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Loading question papers...</p>
        </div>
      </main>
    }>
      <PaperArchive 
        university={university}
        uniRecord={uniRecord}
        collegeRecord={collegeRecord}
        courseRecord={courseRecord}
        selectedSemester={selectedSemester}
        selectedSubject={selectedSubject}
        allPapers={allPapers || []}
        examTypes={examTypes}
        years={years}
      />
    </React.Suspense>
  );
}

export async function generateStaticParams() {
  const { data: universities } = await supabase
    .from('universities')
    .select('code');
    
  if (!universities) return [];
  
  return universities.map((uni) => ({
    university: uni.code,
    slug: [], // Base university route
  }));
}
