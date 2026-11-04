# Schema v2 review — invariants and access model

The initial schema is a structural baseline. Before production release, enforce the following cross-table invariants in PostgreSQL (not only the application):

- A course subject's semester must be from the academic scheme used by its institution course offering.
- A paper's examination category must belong to the paper's examination scheme.
- A paper's examination scheme must match its authority institution and academic scheme.
- The paper's semester and course subject must agree with the paper's academic scheme.
- The course subject's offering must reference the same academic programme as the paper.
- A paper's assessment type must belong to the selected examination category and conducting institution.
- Internal Exams papers must not list Private in `paper_student_categories`; they should require Regular eligibility.
- Semester Exam may list Regular, Private, or both depending on the actual paper.
- When a paper is reached through an institution context, eligibility must consider the target institution's active offering, affiliation/relationship, authority, programme, academic scheme and subject mapping.
- A manual exclude always vetoes automatic visibility; a manual include is an explicit exception but must still satisfy hard safety rules (published status, matching academic identity, student category).

Recommended implementation: add composite unique keys for stable academic dimensions and use composite foreign keys where possible. Use constraint triggers only for invariants that cannot be represented with declarative constraints. Every trigger must use a fixed search_path, have explicit execution grants and include tests.

## Access model for release

Current baseline intentionally does not expose `papers`, visibility decisions, AI payloads, processing jobs, or audit logs to anonymous/authenticated users. The Next.js server currently uses the Supabase service role; it must not return unrestricted rows or signed URLs without checking access.

Before opening read access:
1. Implement a security-invoker view or RPC that accepts an institution context and paper id/filter.
2. It must resolve automatic eligibility and the manual override semantics.
3. Require `is_published = true`.
4. Filter the selected student category; reject Internal Exams for Private.
5. Return only public paper metadata (never raw extracted text or private admin fields).
6. Implement a download action that re-runs the same policy before minting a short-lived Storage signed URL.
7. Test both allowed and denied cases using SQL/RLS tests.

## Deployment gate
Never promote this migration to the existing production project until:
- the full v2 app has been switched and tested against this schema,
- the database invariants and access tests pass,
- backup/export of all legacy data and storage files is complete,
- old and new paper counts/checksums/AI relationships reconcile,
- a rollback plan exists.
