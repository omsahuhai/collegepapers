# CollegePapers database v2

## Scope
Clean v2 architecture for a new hosted development project. This does not migrate, alter, or delete anything in the legacy Supabase project.

## Fixed decisions
- Single `institutions` registry for universities, affiliated colleges and autonomous colleges.
- `institution_relationships` captures affiliation without forcing autonomous colleges under a university.
- Programme identity is separate from institution-specific offerings.
- Each offering explicitly names teaching institution, awarding institution, examination authority and academic scheme.
- Curriculum schemes are data-driven. Initial target scheme slug is **`cbcs`**. Do not substitute `nep-2020`.
- User-facing examination category labels are exactly **Semester Exam** and **Internal Exams**.
- CIA I/CIA II/Internal Test 1 are institution-configurable assessment types.
- Regular/Private are paper student-eligibility categories, not exam categories. Internal Exams should be eligible for Regular students only.
- A question paper is one canonical record/file; institution discovery is a separate access/visibility relationship.
- Automatic eligibility uses exact authority + academic programme + scheme + applicable offering/subject alignment. Explicit exclusions veto automatic inclusion.
- University-only programmes do not become available to affiliated colleges simply because the same university is the authority.
- Autonomous colleges are top-level institutions and maintain their own exam schemes.
- PDFs are in a private `papers` bucket. Never put the consumer college in the path for a shared university paper.
- Application dates display in Asia/Kolkata; timestamps are stored as timestamptz.

## Tables
Institutions: `institutions`, `institution_relationships`.
Academics: `academic_programs`, `institution_course_offerings`, `academic_schemes`, `semesters`, `course_subjects`.
Examinations: `examination_schemes`, `examination_categories`, `assessment_types`.
Papers: `papers`, `paper_student_categories`, `paper_institution_visibility`.
AI: `paper_intelligence`, `paper_questions`, `paper_processing_jobs`.
Users/admin: `profiles`, `bookmarks`, `admin_roles`, `audit_logs`.

## Storage key
`question-papers/{authority-code}/{program-code}/{scheme-code}/semester-{n}/{subject-code}/{semester-exam|internal-exams}/{session}/{assessment-code?}.pdf`

CBCS example:
`question-papers/prsu/bca/cbcs/semester-1/cf-101/semester-exam/2026.pdf`

## Must-pass rules before app integration
1. Shared university paper appears only in eligible affiliated colleges with exact matching programme/scheme/subject arrangements.
2. University-only programme papers remain at university context.
3. Explicit exclusion overrides auto-inclusion.
4. Internal exam is tied to an assessment type for the conducting institution.
5. Regular/Private eligibility is explicit; Private cannot access Internal Exams.
6. Private Storage bucket; signed download URL only after server-side publication, visibility and category checks.
7. Service-role secret never reaches browser.
8. Cross-table consistency must be enforced for paper/exam scheme/category/authority/programme/scheme/semester/subject and subject offering/semester scheme. Implement validated triggers or composite foreign keys before importing records.
9. Visibility SQL view/RPC must be tested with positive and negative fixtures before paper SELECT is exposed.
10. Add admin mutation authorization before uploads or edits are enabled.

## Baseline limitations intentionally left for the next migration
- Public paper access is not enabled yet. The first schema migration leaves direct paper SELECT disabled until visibility RPC is implemented and verified.
- No demo institutions or CBCS data are seeded; production facts and ids are not guessed.
- Add RLS policy for trusted admin mutations only after the app's auth/admin workflow is implemented.
- Add triggers/constraints for cross-table invariants and Internal Exams/Regular-only student eligibility.
- Add signed-URL download RPC/action and storage object write controls.
- Add RLS/visibility unit tests and migration replay CI.
