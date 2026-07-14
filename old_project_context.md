# Project Context: College Papers Portal (collegepapers.in)

This document provides a comprehensive overview of the **College Papers Portal** project, summarizing its architecture, tech stack, database integration, app flows, and recent history.

---

## 1. Overview
The **College Papers Portal** is a lightweight, single-page web application designed to help college students easily navigate, find, and download Previous Year Questions (PYQs) or exam papers for their respective institutes, courses, and semesters. 

- **Primary URL Domain**: `collegepapers.in`
- **Current Target Location**: Hardcoded references to "Raipur" (e.g. card subtitles).

---

## 2. File Structure
The project is a minimal, serverless web page. Its workspace contains:
- **[index.html](file:///Users/omsahu/Created/Code/AI/logicofcollegepapers/index.html)**: The entire web application containing the HTML structure, CSS styling, and client-side JavaScript logic.
- **`.git`**: Version control repository.

---

## 3. Technology Stack & External Services
- **Frontend Core**: Vanilla HTML5 and ES6+ JavaScript.
- **Styling**: Built-in CSS (contained in a `<style>` block in the head). It defines a clean, modern, card-based interface with light-mode colors:
  - `--primary`: `#2563eb` (Blue)
  - `--bg`: `#ffffff` (White)
  - `--card-bg`: `#e0e0e0` (Light grey)
  - `--text`: `#000000` (Black)
  - `--text-secondary`: `#555555` (Grey)
- **Database & Storage (Backend-as-a-Service)**: **Supabase**
  - Loaded via CDN script: `@supabase/supabase-js@2`
  - **Supabase URL**: `https://osdqszlyyhetdnlargrn.supabase.co`
  - **Supabase Anonymous Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...wVHU1yPCgz0w6U2SwjvdK0j5HmS5mXUnwwXAwFuPwAM`
  - **Supabase Client Init**: `supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`

---

## 4. Database Schema (Inferred)
The database structure is inferred from client queries matching the Supabase table `papers_metadata` and the storage bucket `papers`.

### Table: `papers_metadata`
| Field | Type | Description |
| :--- | :--- | :--- |
| `university` | String | Name of the University/Institute (e.g., Pt. Ravishankar Shukla University) |
| `uni_image_url` | String (URL) | URL path to the logo/image of the university |
| `college` | String | Associated college name (null or empty for autonomous institutions) |
| `col_image_url` | String (URL) | URL path to the logo/image of the college |
| `course` | String | Degree/Course name (e.g., B.C.A., B.Sc.) |
| `semester` | Number/String | Academic semester |
| `year` | Number/String | Exam year of the paper |
| `subject` | String | Subject name of the exam |
| `file_url` | String | File path inside the Supabase storage bucket `papers` pointing to the PDF document |

### Storage Bucket: `papers`
- Stores all PDF documents.
- Access is secured/requested via signed URLs with a short lifespan (30 seconds) created using the Supabase Storage API:
  ```javascript
  client.storage.from('papers').createSignedUrl(path, 30, { download: `${filename}.pdf` })
  ```

---

## 5. Application Funnel & Navigation Logic
The portal guides users through a multi-step selection funnel to narrow down to the correct exam paper.

### Selection Steps (Levels)
1. **Level 1: Select Institute**
   - Heading: "Select Your Institute"
   - Queries: `university` and `uni_image_url` (grouped uniquely).
   - Display: Renders as a grid of cards (`funnel-grid`).
2. **Level 2: Select College**
   - Heading: "Select Your College"
   - Queries: `college` and `col_image_url` where `university = selectedUniversity`.
   - **Auto-Skip Feature**: If the university has no child colleges in the query response (i.e. `actualColleges.length === 0`), it automatically marks college selection as empty `""`, sets `skippedCollegeStep = true`, and skips forward to the Course Selection level.
3. **Level 3: Select Course**
   - Heading: "Select Your Course"
   - Queries: Unique `course` values matching `university` and `college`.
   - Display: Flat list view (`list-container`).
4. **Level 4: Select Semester**
   - Heading: "Select Your Semester"
   - Queries: Unique `semester` values matching `university`, `college`, and `course`.
   - Display: Flat list view showing `"Semester <semester>"`.
5. **Level 5: Select Year**
   - Heading: "Select Year"
   - Queries: Unique `year` values matching `university`, `college`, `course`, and `semester`.
   - Display: Flat list view showing `"Previous Year Questions <year>"`.
6. **Level 6: Download Paper**
   - Heading: "Download Your Paper"
   - Queries: All subjects (`*`) matching current selection state.
   - Display: Renders matching papers with a subject title and a green "Download" button.

### Navigation Controls
- **Back Button**: Appears if the user is past the first step.
- **Backtracking Logic (`goBack`)**: Handles step-by-step state reset. If the College step was auto-skipped (`skippedCollegeStep = true`), going back from the Course level will correctly jump past the College selection page back to the University selection screen.

---

## 6. Secure & Direct Download Flow (`downloadPdf`)
To avoid browsers opening the PDF in a new preview tab, a direct download is forced:
1. Requests a signed URL from Supabase with the parameter `{ download: "${filename}.pdf" }` to force `Content-Disposition: attachment` headers.
2. Fetches the binary content of the file: `fetch(signedUrl)`.
3. Converts the response into a local binary blob: `response.blob()`.
4. Creates a temporary object URL: `window.URL.createObjectURL(blob)`.
5. Programmatically generates a hidden link (`<a>`), sets its `href` to the blob URL, assigns the `download` filename, simulates a click to prompt the user's browser download dialog, and immediately cleans up memory allocations (`revokeObjectURL` and element removal).

---

## 7. Version History (Recent Features & Commits)
- **July 12, 2026**: Force direct file downloads by fetching binary blobs and using object URLs (avoids simple inline previewing).
- **July 6, 2026**: Removed PDF viewer modal to prefer direct download functionality; added automatic college step skipping.
- **July 6, 2026**: Added year selection step to the funnel and updated the header banner styling.
- **July 6, 2026**: Repository initialized with the first commit.
