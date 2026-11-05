import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('paper_id');
  const institutionId = searchParams.get('institution');
  const category = (searchParams.get('category') || '').toLowerCase();

  if (!UUID.test(paperId || '') || !UUID.test(institutionId || '') || !['regular', 'private'].includes(category)) {
    return NextResponse.json({ error: 'A valid paper, institution and student category are required.' }, { status: 400 });
  }

  try {
    const { data: allowed, error: eligibilityError } = await supabase.rpc('is_paper_visible_to_institution', {
      p_paper_id: paperId,
      p_institution_id: institutionId,
      p_student_category: category,
    });
    if (eligibilityError) return NextResponse.json({ error: 'Unable to verify paper eligibility.' }, { status: 503 });
    if (allowed !== true) return NextResponse.json({ error: 'Paper is not available in this academic context.' }, { status: 403 });

    const { data: intelligence, error } = await supabase
      .from('paper_intelligence')
      .select('id, status, summary, syllabus_weightage, topic_frequency, processed_at')
      .eq('paper_id', paperId)
      .maybeSingle();

    if (error) throw error;
    if (!intelligence || intelligence.status !== 'completed') {
      return NextResponse.json({ error: 'AI analysis is not available for this paper yet.' }, { status: 404 });
    }

    const { data: questions, error: questionsError } = await supabase
      .from('paper_questions')
      .select('id, question_number, question_text, marks, section_label, unit_reference, topic_tags, display_order')
      .eq('paper_intelligence_id', intelligence.id)
      .order('display_order', { ascending: true });
    if (questionsError) throw questionsError;

    return NextResponse.json({ cached: true, intelligence, questions: questions || [] }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Paper analysis read failed:', error);
    return NextResponse.json({ error: 'Unable to load paper analysis.' }, { status: 500 });
  }
}
