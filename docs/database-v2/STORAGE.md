# Storage baseline

The `papers` bucket is private, PDF-only and capped at 50 MiB per object.

Object key:
`question-papers/{authority-code}/{program-code}/{scheme-code}/semester-{n}/{subject-code}/{semester-exam|internal-exams}/{session}/{assessment-code?}.pdf`

CBCS example:
`question-papers/prsu/bca/cbcs/semester-1/cf-101/semester-exam/2026.pdf`

Shared university Semester Exam papers are stored once under the examination authority, not duplicated under each affiliated college. Internal assessment files are stored under the conducting institution's authority code.

Issue a short-lived signed URL only after the server verifies published status, institution visibility and student category eligibility. Do not enable public bucket access or browser-side service-role operations.
