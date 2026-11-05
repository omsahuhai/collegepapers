import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORIES = new Set(['regular', 'private']);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('id');
  const institutionId = searchParams.get('institution');
  const studentCategory = (searchParams.get('category') || '').toLowerCase();

  if (!UUID.test(paperId || '') || !UUID.test(institutionId || '') || !CATEGORIES.has(studentCategory)) {
    return NextResponse.json({ error: 'A valid paper, institution and student category are required.' }, { status: 400 });
  }

  try {
    const { data: allowed, error: eligibilityError } = await supabase.rpc(
      'is_paper_visible_to_institution',
      {
        p_paper_id: paperId,
        p_institution_id: institutionId,
        p_student_category: studentCategory,
      }
    );

    if (eligibilityError) {
      console.error('Paper eligibility check failed:', eligibilityError.code);
      return NextResponse.json({ error: 'Unable to verify paper eligibility.' }, { status: 503 });
    }
    if (allowed !== true) {
      return NextResponse.json({ error: 'This paper is not available for the selected institution and student category.' }, { status: 403 });
    }

    const { data: paper, error: paperError } = await supabase
      .from('papers')
      .select('id, storage_bucket, storage_path, original_filename, mime_type, file_size_bytes, examination_session, course_subjects(subject_name, subject_code)')
      .eq('id', paperId)
      .eq('is_published', true)
      .single();

    if (paperError || !paper || paper.mime_type !== 'application/pdf' || !paper.storage_path) {
      return NextResponse.json({ error: 'Published paper not found.' }, { status: 404 });
    }
    if (paper.storage_bucket !== 'papers') {
      return NextResponse.json({ error: 'Invalid paper storage configuration.' }, { status: 500 });
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from('papers')
      .createSignedUrl(paper.storage_path, 60, {
        download: paper.original_filename || undefined,
      });

    if (signedError || !signed?.signedUrl) {
      console.error('Signed URL creation failed:', signedError?.message);
      return NextResponse.json({ error: 'Unable to create a secure download link.' }, { status: 503 });
    }

    return NextResponse.redirect(signed.signedUrl, {
      status: 302,
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Download handler failed:', error);
    return NextResponse.json({ error: 'Download could not be completed.' }, { status: 500 });
  }
}
