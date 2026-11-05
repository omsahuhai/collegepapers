import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request) {
  try {
    const body = await request.json();
    const paperId = body.paper_id;
    const institutionId = body.institution;
    const category = String(body.category || '').toLowerCase();
    const exam = String(body.exam || '').slice(0, 120);
    const studyHours = Number(body.studyHours);
    const completed = Number(body.completed);
    const goal = String(body.goal || '').slice(0, 120);

    if (!UUID.test(paperId || '') || !UUID.test(institutionId || '') ||
        !['regular', 'private'].includes(category) || !exam || !goal ||
        !Number.isFinite(studyHours) || studyHours < 0.5 || studyHours > 48 ||
        !Number.isFinite(completed) || completed < 0 || completed > 100) {
      return NextResponse.json({ error: 'Invalid strategy request.' }, { status: 400 });
    }

    const { data: allowed, error: eligibilityError } = await supabase.rpc('is_paper_visible_to_institution', {
      p_paper_id: paperId, p_institution_id: institutionId, p_student_category: category,
    });
    if (eligibilityError) return NextResponse.json({ error: 'Unable to verify paper eligibility.' }, { status: 503 });
    if (allowed !== true) return NextResponse.json({ error: 'Paper is not available in this academic context.' }, { status: 403 });

    const { data: paper, error: paperError } = await supabase
      .from('papers')
      .select('id, course_subjects(subject_name, subject_code), paper_intelligence(id, status, summary, syllabus_weightage, topic_frequency)')
      .eq('id', paperId).eq('is_published', true).single();
    if (paperError || !paper) return NextResponse.json({ error: 'Paper not found.' }, { status: 404 });

    const intelligence = Array.isArray(paper.paper_intelligence) ? paper.paper_intelligence[0] : paper.paper_intelligence;
    if (!intelligence || intelligence.status !== 'completed') {
      return NextResponse.json({ error: 'Complete AI analysis is not available for this paper yet.' }, { status: 409 });
    }

    const { data: questions, error: questionError } = await supabase
      .from('paper_questions')
      .select('question_text, marks, unit_reference, topic_tags')
      .eq('paper_intelligence_id', intelligence.id)
      .order('display_order', { ascending: true }).limit(20);
    if (questionError) throw questionError;

    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'AI strategy is temporarily unavailable.' }, { status: 503 });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const subject = Array.isArray(paper.course_subjects) ? paper.course_subjects[0] : paper.course_subjects;

    const prompt = [
      'Create a cautious, practical exam revision strategy. Do not claim guaranteed marks or pass probability.',
      'Return valid JSON with keys: strategyTitle, confidenceNote, focusTopics, postponeTopics, practiceQuestions, revisionTimeline, examHallStrategy.',
      'focusTopics and postponeTopics are arrays of strings.',
      'practiceQuestions is an array of strings.',
      'revisionTimeline is an array of objects with time and task strings.',
      'examHallStrategy is an array of strings.',
      'Treat historical frequency as evidence, not a prediction. Clearly state uncertainty.',
      JSON.stringify({
        subject: subject?.subject_name, subjectCode: subject?.subject_code, exam, studyHours,
        completedSyllabusPercent: completed, goal,
        syllabusWeightage: intelligence.syllabus_weightage,
        topicFrequency: intelligence.topic_frequency,
        summary: intelligence.summary,
        questions: (questions || []).map(q => ({ text: q.question_text, marks: q.marks, unit: q.unit_reference, tags: q.topic_tags })),
      }),
    ].join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });
    const strategy = JSON.parse(response.text || '{}');
    return NextResponse.json({ strategy }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error) {
    console.error('Pass strategy failed:', error);
    return NextResponse.json({ error: 'Unable to generate a study strategy right now.' }, { status: 500 });
  }
}
