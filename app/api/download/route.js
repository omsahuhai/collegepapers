import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('id');

    if (!paperId || !UUID_REGEX.test(paperId)) {
      return new Response('Invalid or missing question paper ID parameter', { status: 400 });
    }

    // SECURITY CHECK: Ensure download is initiated from within our website pages
    const secFetchSite = request.headers.get('sec-fetch-site') || '';
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';

    // Allow if sec-fetch-site is same-origin/same-site OR if referer matches our host domain
    const isSameOriginOrSite = secFetchSite === 'same-origin' || secFetchSite === 'same-site' || (referer && host && referer.includes(host));

    if (!isSameOriginOrSite) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Secure Download Protection - CollegePapers.in</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="refresh" content="2;url=/" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #fdf6e3;
              background-image: radial-gradient(circle, rgba(147, 161, 161, 0.15) 2px, transparent 2px);
              background-size: 32px 32px;
              color: #073642;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 1.5rem;
            }
            .card {
              background: #ffffff;
              padding: 2.5rem 2rem;
              border-radius: 20px;
              border: 1px solid rgba(147, 161, 161, 0.3);
              box-shadow: 0 12px 32px rgba(7, 54, 66, 0.1);
              max-width: 480px;
              text-align: center;
            }
            .icon-wrapper {
              width: 56px;
              height: 56px;
              border-radius: 16px;
              background: rgba(42, 161, 152, 0.12);
              color: #2aa198;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1.25rem;
            }
            h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.75rem; color: #073642; }
            p { font-size: 0.95rem; line-height: 1.6; color: #586e75; margin-bottom: 1.75rem; }
            .btn {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.5rem;
              background: #2aa198;
              color: #ffffff;
              font-weight: 600;
              font-size: 0.92rem;
              border-radius: 12px;
              text-decoration: none;
              box-shadow: 0 4px 14px rgba(42, 161, 152, 0.25);
              transition: all 0.2s ease;
            }
            .btn:hover { background: #228b82; transform: translateY(-1px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-wrapper">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2>Protected PYQ Document</h2>
            <p>Direct file links are protected to prevent unauthorized redistribution and keep our student archives free. Redirecting you to <strong>CollegePapers.in</strong> where you can view and download all papers directly from our repository.</p>
            <a href="/" class="btn">
              <span>Go to Question Papers Vault</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    // 1. Fetch paper details from database
    const { data: paper, error: fetchError } = await supabase
      .from('papers')
      .select('id, subject_name, semester, examination_session, file_path, download_count')
      .eq('id', paperId)
      .single();

    if (fetchError || !paper || !paper.file_path) {
      return new Response(`
        <html><body>
          <h2 style="font-family: sans-serif; color: #555; text-align: center; margin-top: 20%;">Sorry, paper not found.</h2>
        </body></html>
      `, { 
        status: 404, 
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, max-age=0'
        } 
      });
    }

    // 2. Format clean filename safely
    const cleanSubject = (paper.subject_name || 'Paper').replace(/[^a-zA-Z0-9-_]/g, '_');
    const cleanSemester = (paper.semester || 'Archive').replace(/[^a-zA-Z0-9-_]/g, '_');
    const cleanSession = (paper.examination_session || 'PYQ').replace(/[^a-zA-Z0-9-_]/g, '_');
    const cleanFilename = `${cleanSubject}_${cleanSemester}_${cleanSession}.pdf`;

    // 3. Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('papers')
      .download(paper.file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading from storage:', downloadError);
      return new Response(`
        <html><body>
          <h2 style="font-family: sans-serif; color: #555; text-align: center; margin-top: 20%;">Sorry, paper not found in storage.</h2>
        </body></html>
      `, { 
        status: 404, 
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, max-age=0'
        } 
      });
    }

    // 4. Update download count on successful download
    supabase
      .from('papers')
      .update({ download_count: (paper.download_count || 0) + 1 })
      .eq('id', paperId)
      .then(({ error }) => {
        if (error) console.error('Warning: Could not update download count:', error.message);
      });

    // 5. Return the file as a stream directly
    return new Response(fileData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}"`,
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error) {
    console.error('Download route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

