import 'server-only';
import { supabase } from './supabase';

const BUCKET_NAME = 'papers';

// normalizes a string into a URL-friendly segment
// e.g. "Semester 2" -> "sem-2"
export function normalizeSegment(str = '') {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/\-+--+/g, '-');
}

// builds the standard file path on the bucket
// format: univ/college/course/semester/subject/filename
export function buildStandardStoragePath({
  universityCode,
  collegeCode = 'univ',
  courseCode,
  semester,
  examType = 'regular',
  subjectCode,
  session,
  filename
}) {
  const uSegment = normalizeSegment(universityCode || 'univ');
  const cSegment = normalizeSegment(collegeCode || 'univ');
  const courseSegment = normalizeSegment(courseCode || 'course');
  const semSegment = normalizeSegment(semester || 'sem');
  const typeSegment = normalizeSegment(examType);
  const cleanSubjectCode = normalizeSegment(subjectCode || 'paper');
  
  // Extract year from session (e.g. "Dec-Jan 2025-26" -> "2025")
  const yearMatch = session?.match(/\d{4}/);
  const yearSegment = yearMatch ? yearMatch[0] : normalizeSegment(session || 'archive');

  // Extract clean extension or default to .pdf
  const extMatch = filename?.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : '.pdf';

  const finalFilename = `${yearSegment}-${typeSegment}${ext}`;

  return `${uSegment}/${cSegment}/${courseSegment}/${semSegment}/${cleanSubjectCode}/${finalFilename}`;
}

// uploads a paper to storage and adds it to the db
export async function createPaper({
  universityId,
  collegeId = null,
  courseId,
  semester,
  examinationSession,
  examType,
  subjectCode,
  subjectName,
  fileBuffer,
  fileContentType = 'application/pdf',
  originalFilename,
  fileSizeBytes = 0
}) {
  // 1. Resolve codes for clean directory structure
  const { data: uni } = await supabase.from('universities').select('code').eq('id', universityId).single();
  let colCode = 'univ';
  if (collegeId) {
    const { data: col } = await supabase.from('colleges').select('code').eq('id', collegeId).single();
    colCode = col?.code || 'univ';
  }
  const { data: course } = await supabase.from('courses').select('code').eq('id', courseId).single();

  const storagePath = buildStandardStoragePath({
    universityCode: uni?.code,
    collegeCode: colCode,
    courseCode: course?.code,
    semester,
    examType,
    subjectCode,
    session: examinationSession,
    filename: originalFilename
  });

  // 2. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: fileContentType,
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 3. Insert record into papers database table
  const { data: insertedPaper, error: dbError } = await supabase
    .from('papers')
    .insert([{
      university_id: universityId,
      college_id: collegeId,
      course_id: courseId,
      semester,
      examination_session: examinationSession,
      exam_type: examType,
      curriculum_scheme: null, // Removed
      subject_code: subjectCode,
      subject_name: subjectName,
      file_path: storagePath,
      file_size_bytes: fileSizeBytes,
      is_published: true
    }])
    .select()
    .single();

  if (dbError) {
    // Rollback storage file on DB error
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Database insert failed: ${dbError.message}`);
  }

  return insertedPaper;
}

// gets download url for a paper
export async function getPaperWithSignedUrl(paperId) {
  const { data: paper, error: dbError } = await supabase
    .from('papers')
    .select('*')
    .eq('id', paperId)
    .single();

  if (dbError || !paper) {
    throw new Error('Paper not found in database');
  }

  const cleanFilename = `${paper.subject_code}_${paper.subject_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(paper.file_path, 60, { download: cleanFilename });

  if (signError || !signedData?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${signError?.message}`);
  }

  return { ...paper, signedUrl: signedData.signedUrl };
}

// updates paper record and moves the storage file if the path changed
export async function updateAndMovePaper(paperId, updates = {}) {
  const { data: existingPaper, error: fetchErr } = await supabase
    .from('papers')
    .select('*')
    .eq('id', paperId)
    .single();

  if (fetchErr || !existingPaper) {
    throw new Error('Paper record not found');
  }

  const merged = { ...existingPaper, ...updates };

  // Check if any hierarchy attribute changed that requires moving the storage path
  const hierarchyChanged =
    updates.semester ||
    updates.exam_type ||
    updates.subject_code ||
    updates.examination_session ||
    updates.university_id !== undefined ||
    updates.college_id !== undefined ||
    updates.course_id !== undefined;

  let newStoragePath = existingPaper.file_path;

  if (hierarchyChanged) {
    // Resolve codes for new path
    const { data: uni } = await supabase.from('universities').select('code').eq('id', merged.university_id).single();
    let colCode = 'univ';
    if (merged.college_id) {
      const { data: col } = await supabase.from('colleges').select('code').eq('id', merged.college_id).single();
      colCode = col?.code || 'univ';
    }
    const { data: course } = await supabase.from('courses').select('code').eq('id', merged.course_id).single();

    newStoragePath = buildStandardStoragePath({
      universityCode: uni?.code,
      collegeCode: colCode,
      courseCode: course?.code,
      semester: merged.semester,
      examType: merged.exam_type,
      subjectCode: merged.subject_code,
      session: merged.examination_session,
      filename: existingPaper.file_path ? existingPaper.file_path.split('/').pop() : '.pdf'
    });

    if (existingPaper.file_path && newStoragePath !== existingPaper.file_path) {
      const { error: moveError } = await supabase.storage
        .from(BUCKET_NAME)
        .move(existingPaper.file_path, newStoragePath);

      if (moveError) {
        throw new Error(`Failed to move physical storage file: ${moveError.message}`);
      }
    }
  }

  // Update DB record
  const { data: updatedPaper, error: dbError } = await supabase
    .from('papers')
    .update({ ...updates, file_path: newStoragePath })
    .eq('id', paperId)
    .select()
    .single();

  if (dbError) {
    throw new Error(`Failed to update DB record: ${dbError.message}`);
  }

  return updatedPaper;
}

// deletes the paper from storage and the db
export async function deletePaper(paperId) {
  const { data: paper, error: fetchErr } = await supabase
    .from('papers')
    .select('id, file_path')
    .eq('id', paperId)
    .single();

  if (fetchErr || !paper) {
    throw new Error('Paper not found for deletion');
  }

  if (paper.file_path) {
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([paper.file_path]);

    if (storageErr) {
      // Intentionally ignoring storage error during deletion to prioritize DB consistency
    }
  }

  const { error: dbErr } = await supabase
    .from('papers')
    .delete()
    .eq('id', paperId);

  if (dbErr) {
    throw new Error(`Failed to delete DB record: ${dbErr.message}`);
  }

  return true;
}

// deletes files from storage that aren't in the database anymore
export async function cleanOrphanedStorageFiles(prefix = '') {
  // 1. List all referenced paths in DB
  const { data: allPapers, error: dbErr } = await supabase
    .from('papers')
    .select('file_path')
    .not('file_path', 'is', null);

  if (dbErr) throw new Error(`DB query failed: ${dbErr.message}`);
  const referencedPaths = new Set(allPapers.map(p => p.file_path));

  // Helper to recursively list all files in bucket
  async function listAllRecursive(folder = '') {
    const { data: items, error } = await supabase.storage.from(BUCKET_NAME).list(folder, { limit: 1000 });
    if (error) throw error;

    let filePaths = [];
    for (const item of items) {
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      if (item.id === null) {
        // Folder -> recurse
        const subFiles = await listAllRecursive(fullPath);
        filePaths = filePaths.concat(subFiles);
      } else {
        filePaths.push(fullPath);
      }
    }
    return filePaths;
  }

  const allStorageFiles = await listAllRecursive(prefix);
  const orphans = allStorageFiles.filter(path => !referencedPaths.has(path));

  if (orphans.length > 0) {
    const { error: removeErr } = await supabase.storage.from(BUCKET_NAME).remove(orphans);
    if (removeErr) throw new Error(`Failed to remove orphaned files: ${removeErr.message}`);
  }

  return { totalScanned: allStorageFiles.length, orphansRemoved: orphans.length, orphans };
}
