import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('id');

    if (!paperId) {
      return new Response('Missing paper ID parameter', { status: 400 });
    }

    // 1. Fetch paper details from database
    const { data: paper, error: fetchError } = await supabase
      .from('papers')
      .select('*')
      .eq('id', paperId)
      .single();

    if (fetchError || !paper) {
      return new Response('Question paper not found', { status: 404 });
    }

    // 2. Increment download count asynchronously
    // We don't block the redirect for this DB operation
    supabase
      .from('papers')
      .update({ download_count: (paper.download_count || 0) + 1 })
      .eq('id', paperId)
      .then(({ error }) => {
        if (error) console.error('Error incrementing download count:', error);
      });

    // 3. Generate a 60-second signed URL for secure file access
    // This forces Content-Disposition attachment headers with a clean filename
    const cleanFilename = `${paper.subject_name.replace(/[^a-zA-Z0-9]/g, '_')}_${paper.semester.replace(/[^a-zA-Z0-9]/g, '_')}_${paper.examination_session.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const { data, error: signError } = await supabase.storage
      .from('papers')
      .createSignedUrl(paper.file_path, 60, {
        download: cleanFilename,
      });

    if (signError || !data?.signedUrl) {
      console.error('Error generating signed URL:', signError);
      return new Response('Error generating download URL', { status: 500 });
    }

    // 4. Issue a 302 redirect to the secure attachment download URL
    return Response.redirect(data.signedUrl, 302);
  } catch (error) {
    console.error('Download route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
